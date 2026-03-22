/**
 * VoiceService - Speech Recognition Service
 *
 * Provides speech recognition functionality with:
 * - Continuous listening mode with automatic restart
 * - TTS echo filtering integration
 * - Configurable preserved words that bypass filtering
 * - Session management for proper state tracking
 *
 * Uses dependency injection - requires an IVoiceAdapter to be provided.
 *
 * @example
 * ```typescript
 * const voice = new VoiceService(adapter);
 * await voice.initialize();
 *
 * await voice.startListening({
 *   config: {
 *     continuous: true,
 *     echoFilterText: 'What is the capital of France?',
 *     preservedWords: ['buzz', 'stop'],
 *   },
 *   callbacks: {
 *     onResult: (result) => console.log(result.text),
 *   },
 * });
 * ```
 */

import type { IVoiceAdapter } from '../types/adapters';
import type { Subscription } from '../types/common';
import type {
  VoiceSessionConfig,
  VoiceListenConfig,
  VoiceServiceCallbacks,
  VoiceResult,
  VoiceSessionState,
} from '../types/voice';
import { generateSessionId } from '../types/common';
import { EchoFilter } from './EchoFilter';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<Omit<VoiceListenConfig, 'echoFilterText' | 'preservedWords'>> = {
  continuous: false,
  locale: 'en-US',
  echoFilterThreshold: 0.4,
  wordSimilarityThreshold: 0.75,
  minWordLength: 2,
  continuousRestartDelayMs: 50, // Reduced from 100ms for better UX
};

/**
 * Recoverable error codes that should trigger restart in continuous mode
 * iOS: 1 = No speech detected, 216 = Cancelled
 * Android: 7 = No speech match, 8 = Speech timeout
 */
const RECOVERABLE_ERROR_CODES = [1, 7, 8, 216];

/**
 * Internal session tracking
 */
interface VoiceSession {
  id: string;
  nativeSessionId: string | null;
  config: Required<VoiceListenConfig>;
  callbacks: VoiceServiceCallbacks;
  echoFilter: EchoFilter | null;
}

/**
 * VoiceService class
 */
export class VoiceService {
  private adapter: IVoiceAdapter;
  private state: VoiceSessionState = 'idle';
  private currentSession: VoiceSession | null = null;
  private isInitialized: boolean = false;
  private isStopping: boolean = false;
  private lastResult: string = '';

  // Preserved words (global, shared across sessions)
  private globalPreservedWords: string[] = [];

  // Echo filter state
  private echoFilterText: string = '';

  // Event subscriptions
  private subscriptions: Subscription[] = [];

  constructor(adapter: IVoiceAdapter) {
    this.adapter = adapter;
  }

  /**
   * Initialize the voice service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Register event listeners
      this.registerEventListeners();

      // Check availability
      const isAvailable = await this.adapter.isAvailable();
      if (!isAvailable) {
        console.warn('[VoiceService] Voice recognition not available');
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[VoiceService] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      return await this.adapter.requestPermission();
    } catch (error) {
      console.error('[VoiceService] Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Clean up the service
   */
  cleanup(): void {
    this.subscriptions.forEach((sub) => sub.remove());
    this.subscriptions = [];
    this.currentSession = null;
    this.state = 'idle';
    this.isInitialized = false;
  }

  /**
   * Start listening for speech
   */
  async startListening(sessionConfig: VoiceSessionConfig): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop any existing session
    await this.stopListeningAsync();

    // Merge config with defaults
    const config: Required<VoiceListenConfig> = {
      continuous: sessionConfig.config.continuous ?? DEFAULT_CONFIG.continuous,
      locale: sessionConfig.config.locale ?? DEFAULT_CONFIG.locale,
      echoFilterText: sessionConfig.config.echoFilterText ?? this.echoFilterText,
      preservedWords: [
        ...this.globalPreservedWords,
        ...(sessionConfig.config.preservedWords ?? []),
      ],
      echoFilterThreshold: sessionConfig.config.echoFilterThreshold ?? DEFAULT_CONFIG.echoFilterThreshold,
      wordSimilarityThreshold: sessionConfig.config.wordSimilarityThreshold ?? DEFAULT_CONFIG.wordSimilarityThreshold,
      minWordLength: sessionConfig.config.minWordLength ?? DEFAULT_CONFIG.minWordLength,
      continuousRestartDelayMs: sessionConfig.config.continuousRestartDelayMs ?? DEFAULT_CONFIG.continuousRestartDelayMs,
    };

    // Create echo filter if we have filter text
    let echoFilter: EchoFilter | null = null;
    if (config.echoFilterText) {
      echoFilter = new EchoFilter({
        primaryText: config.echoFilterText,
        preservedWords: config.preservedWords,
        matchRatioThreshold: config.echoFilterThreshold,
        wordSimilarityThreshold: config.wordSimilarityThreshold,
        minWordLength: config.minWordLength,
      });
    }

    // Create session
    const session: VoiceSession = {
      id: generateSessionId(),
      nativeSessionId: null,
      config,
      callbacks: sessionConfig.callbacks,
      echoFilter,
    };

    this.currentSession = session;
    this.state = 'listening';

    try {
      const nativeSessionId = await this.adapter.start({ locale: config.locale });
      session.nativeSessionId = nativeSessionId;
      return session.id;
    } catch (error) {
      this.currentSession = null;
      this.state = 'idle';
      throw error;
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    await this.stopListeningAsync();
  }

  /**
   * Internal stop implementation
   */
  private async stopListeningAsync(): Promise<void> {
    if (this.state === 'idle' || this.isStopping) {
      return;
    }

    this.isStopping = true;
    const wasSession = this.currentSession;

    this.currentSession = null;
    this.state = 'stopping';

    try {
      await this.adapter.stop();
    } catch {
      // Ignore errors during stop
    }

    this.state = 'idle';
    this.isStopping = false;

    // Notify end
    wasSession?.callbacks.onEnd?.(wasSession.id);
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  getState(): VoiceSessionState {
    return this.state;
  }

  isListening(): boolean {
    return this.state === 'listening';
  }

  getCurrentSessionId(): string | null {
    return this.currentSession?.id ?? null;
  }

  getLastResult(): string {
    return this.lastResult;
  }

  // ============================================================================
  // Echo Filter Management
  // ============================================================================

  /**
   * Set the echo filter text (updates current session if active)
   */
  setEchoFilterText(text: string): void {
    this.echoFilterText = text;

    // Update current session's echo filter if active
    if (this.currentSession?.echoFilter) {
      this.currentSession.echoFilter.updateConfig({ primaryText: text });
    } else if (this.currentSession && text) {
      // Create new echo filter for current session
      this.currentSession.echoFilter = new EchoFilter({
        primaryText: text,
        preservedWords: this.currentSession.config.preservedWords,
        matchRatioThreshold: this.currentSession.config.echoFilterThreshold,
        wordSimilarityThreshold: this.currentSession.config.wordSimilarityThreshold,
        minWordLength: this.currentSession.config.minWordLength,
      });
    }
  }

  /**
   * Clear the echo filter
   */
  clearEchoFilter(): void {
    this.echoFilterText = '';

    if (this.currentSession) {
      this.currentSession.echoFilter = null;
    }
  }

  /**
   * Set global preserved words (applies to all sessions)
   */
  setPreservedWords(words: string[]): void {
    this.globalPreservedWords = [...words];

    // Update current session if active
    if (this.currentSession?.echoFilter) {
      const allPreserved = [
        ...this.globalPreservedWords,
        ...(this.currentSession.config.preservedWords.filter(
          (w) => !this.globalPreservedWords.includes(w)
        )),
      ];
      this.currentSession.echoFilter.updateConfig({ preservedWords: allPreserved });
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private registerEventListeners(): void {
    // Voice Start
    this.subscriptions.push(
      this.adapter.addEventListener('voice-start', (event) => {
        const session = this.currentSession;
        if (!session || this.isStopping) {
          return;
        }

        // Update native session ID
        session.nativeSessionId = event.sessionId;
        session.callbacks.onStart?.(session.id);
      })
    );

    // Voice Result
    this.subscriptions.push(
      this.adapter.addEventListener('voice-result', (event) => {
        this.handleVoiceResult(event.text, event.isFinal, event.sessionId);
      })
    );

    // Voice End
    this.subscriptions.push(
      this.adapter.addEventListener('voice-end', (event) => {
        const session = this.currentSession;
        if (!session || this.isStopping || session.nativeSessionId !== event.sessionId) {
          return;
        }

        // In continuous mode, don't notify end - we'll restart
        if (!session.config.continuous) {
          this.state = 'idle';
          session.callbacks.onEnd?.(session.id);
        }
      })
    );

    // Voice Error
    this.subscriptions.push(
      this.adapter.addEventListener('voice-error', (event) => {
        const session = this.currentSession;
        if (!session || this.isStopping || session.nativeSessionId !== event.sessionId) {
          return;
        }

        // Check if this is a recoverable error in continuous mode
        if (session.config.continuous && RECOVERABLE_ERROR_CODES.includes(event.code)) {
          setTimeout(() => {
            if (this.state === 'listening' && !this.isStopping) {
              this.restartListening();
            }
          }, 500);
          return;
        }

        // Non-recoverable error
        this.state = 'idle';
        this.currentSession = null;
        session.callbacks.onError?.(event.error, session.id);
      })
    );
  }

  private handleVoiceResult(text: string, isFinal: boolean, nativeSessionId: string): void {
    const session = this.currentSession;
    if (!session || this.isStopping || session.nativeSessionId !== nativeSessionId) {
      return;
    }

    const rawText = text || '';
    if (rawText.trim().length === 0) {
      // Handle continuous mode restart for empty final results
      if (isFinal && session.config.continuous && this.state === 'listening') {
        this.scheduleRestart();
      }
      return;
    }

    // Apply echo filtering if configured
    let processedText = rawText;
    let wasFiltered = false;
    let originalText: string | undefined;

    if (session.echoFilter) {
      const filterResult = session.echoFilter.filter(rawText);
      processedText = filterResult.text;
      wasFiltered = filterResult.filtered;
      originalText = wasFiltered ? rawText : undefined;

      if (wasFiltered) {
        // Filtered as echo - don't forward, but handle continuous restart
        if (isFinal && session.config.continuous && this.state === 'listening') {
          this.scheduleRestart();
        }
        return;
      }
    }

    // Create result
    const result: VoiceResult = {
      text: processedText,
      isFinal,
      wasFiltered,
      originalText,
      sessionId: session.id,
    };

    // Forward to callbacks
    if (isFinal) {
      this.lastResult = processedText;
      session.callbacks.onResult?.(result);
    } else {
      session.callbacks.onPartialResult?.(result);
    }

    // Handle continuous mode restart
    if (isFinal && session.config.continuous && this.state === 'listening') {
      this.scheduleRestart();
    }
  }

  private async scheduleRestart(): Promise<void> {
    const session = this.currentSession;
    if (!session || this.isStopping || this.state !== 'listening') {
      return;
    }

    // FIX: Reduced delay from 100ms for better UX
    await new Promise((resolve) =>
      setTimeout(resolve, session.config.continuousRestartDelayMs)
    );

    if (this.state === 'listening' && !this.isStopping && this.currentSession?.id === session.id) {
      this.restartListening();
    }
  }

  private async restartListening(): Promise<void> {
    const session = this.currentSession;
    if (!session || this.isStopping) {
      return;
    }

    try {
      const nativeSessionId = await this.adapter.start({ locale: session.config.locale });
      session.nativeSessionId = nativeSessionId;
    } catch (error) {
      console.error('[VoiceService] Failed to restart:', error);
      this.state = 'idle';
      this.currentSession = null;
      session.callbacks.onError?.('Failed to restart listening', session.id);
    }
  }
}

/**
 * Create a VoiceService instance
 */
export function createVoiceService(adapter: IVoiceAdapter): VoiceService {
  return new VoiceService(adapter);
}
