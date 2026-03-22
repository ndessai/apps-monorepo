/**
 * TTSService - Text-to-Speech Service
 *
 * Provides text-to-speech functionality with:
 * - Session management to handle overlapping requests
 * - Progress callbacks that work for ALL voice types (fix from original)
 * - Finish callbacks with detailed interrupt status
 * - Stop trigger support for voice interruption
 *
 * Uses dependency injection - requires an ITTSAdapter to be provided.
 *
 * @example
 * ```typescript
 * const tts = new TTSService(adapter);
 * await tts.initialize();
 *
 * const sessionId = await tts.speak({
 *   text: 'Hello world',
 *   onProgress: (info) => console.log(`${info.percentage}%`),
 *   onFinish: (info) => {
 *     if (info.status === 'interrupted') {
 *       console.log(`Interrupted by: ${info.interruptInfo?.trigger}`);
 *     }
 *   },
 * });
 * ```
 */

import type {
  ITTSAdapter,
  TTSAdapterOptions,
} from '../types/adapters';
import type {
  Subscription,
} from '../types/common';
import type {
  TTSSessionConfig,
  TTSProgressInfo,
  TTSFinishInfo,
  TTSCompletionStatus,
  TTSInterruptInfo,
  VoiceInfo,
  VoiceConfig,
  StopTriggerConfig,
} from '../types/tts';
import { generateSessionId } from '../types/common';
import {
  isWordBoundary,
  getWordAtIndex,
  countWords,
  findNextWordBoundary,
} from '../utils/wordBoundary';
import { containsAnyWord } from '../utils/similarity';

/**
 * TTS Session State
 */
export type TTSState = 'idle' | 'speaking' | 'paused' | 'stopping';

/**
 * Internal session tracking
 */
interface TTSSession {
  id: string;
  text: string;
  startTime: number;
  charIndex: number;
  lastReportedCharIndex: number;
  totalWords: number;
  stopTriggers?: StopTriggerConfig;
  interruptInfo?: TTSInterruptInfo;
  onProgress?: (info: TTSProgressInfo) => void;
  onFinish?: (info: TTSFinishInfo) => void;
  onError?: (error: string, sessionId: string) => void;
  onStart?: (sessionId: string) => void;
}

/**
 * TTSService class
 */
export class TTSService {
  private adapter: ITTSAdapter;
  private state: TTSState = 'idle';
  private currentSession: TTSSession | null = null;
  private lastSpokenText: string = '';
  private isInitialized: boolean = false;
  private isStopping: boolean = false;

  // Event subscriptions
  private subscriptions: Subscription[] = [];

  // Voice profiles
  private voiceProfiles: Map<string, VoiceConfig> = new Map();
  private availableVoiceIds: Set<string> = new Set();

  constructor(adapter: ITTSAdapter) {
    this.adapter = adapter;
  }

  /**
   * Initialize the TTS service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Register event listeners
    this.registerEventListeners();

    // Cache available voices
    try {
      const voices = await this.adapter.getVoices();
      voices.forEach((voice) => {
        this.availableVoiceIds.add(voice.id);
      });
    } catch (error) {
      console.warn('[TTSService] Failed to get voices:', error);
    }

    this.isInitialized = true;
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
   * Register a voice profile for later use
   */
  registerVoiceProfile(name: string, config: VoiceConfig): void {
    this.voiceProfiles.set(name, config);
  }

  /**
   * Get a registered voice profile
   */
  getVoiceProfile(name: string): VoiceConfig | undefined {
    return this.voiceProfiles.get(name);
  }

  /**
   * Get available voices from the adapter
   */
  async getAvailableVoices(): Promise<VoiceInfo[]> {
    return this.adapter.getVoices();
  }

  /**
   * Speak text with configuration
   * Returns session ID
   */
  async speak(config: TTSSessionConfig): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop any existing session
    await this.stopAsync('new_speech');

    // Create new session
    const session: TTSSession = {
      id: generateSessionId(),
      text: config.text,
      startTime: Date.now(),
      charIndex: 0,
      lastReportedCharIndex: 0,
      totalWords: countWords(config.text),
      stopTriggers: config.options?.stopTriggers,
      onProgress: config.onProgress,
      onFinish: config.onFinish,
      onError: config.onError,
      onStart: config.onStart,
    };

    this.currentSession = session;
    this.lastSpokenText = config.text;
    this.state = 'speaking';

    // Resolve voice config
    const voiceConfig = this.resolveVoiceConfig(config.options?.voiceConfig);

    try {
      await this.adapter.speak(config.text, voiceConfig);
      return session.id;
    } catch (error) {
      // Handle speak failure
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.handleError(errorMsg, session.id);
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  async stop(reason: 'manual' | 'stop_trigger' = 'manual'): Promise<void> {
    await this.stopAsync(reason === 'stop_trigger' ? 'stop_trigger' : 'manual_stop');
  }

  /**
   * Internal stop with reason
   */
  private async stopAsync(
    trigger: 'stop_trigger' | 'manual_stop' | 'new_speech',
    triggerMatch?: string
  ): Promise<void> {
    if (this.state === 'idle' || this.isStopping) {
      return;
    }

    this.isStopping = true;

    const session = this.currentSession;
    if (session && trigger !== 'new_speech') {
      // Set interrupt info for finish callback
      session.interruptInfo = {
        trigger,
        triggerMatch,
        interruptedAtChar: session.charIndex,
        interruptedAtWord: getWordAtIndex(session.text, session.charIndex)?.wordIndex,
      };
    }

    // Store session reference before clearing
    const wasSession = this.currentSession;

    // Clear current session
    this.currentSession = null;
    this.state = 'stopping';

    try {
      await this.adapter.stop();
    } catch {
      // Ignore errors during stop
    }

    this.state = 'idle';
    this.isStopping = false;

    // Call finish callback if we had a session and this wasn't a new_speech trigger
    if (wasSession && trigger !== 'new_speech') {
      this.callFinishCallback(wasSession, 'interrupted');
    }
  }

  /**
   * Pause speaking (iOS only)
   */
  async pause(): Promise<void> {
    if (this.state !== 'speaking') {
      return;
    }

    try {
      await this.adapter.pause();
      this.state = 'paused';
    } catch (error) {
      console.warn('[TTSService] Pause not supported or failed:', error);
    }
  }

  /**
   * Resume speaking (iOS only)
   */
  async resume(): Promise<void> {
    if (this.state !== 'paused') {
      return;
    }

    try {
      await this.adapter.resume();
      this.state = 'speaking';
    } catch (error) {
      console.warn('[TTSService] Resume not supported or failed:', error);
    }
  }

  /**
   * Handle stop trigger detected by voice service
   */
  handleStopTrigger(triggerWord: string): void {
    if (this.state !== 'speaking' || !this.currentSession) {
      return;
    }

    // Check if this trigger is in our configured stop triggers
    const triggers = this.currentSession.stopTriggers;
    if (!triggers?.words?.length) {
      return;
    }

    const match = containsAnyWord(
      triggerWord,
      triggers.words,
      triggers.similarityThreshold ?? 0.7
    );

    if (match.matches) {
      this.stopAsync('stop_trigger', match.matchedWord).catch(() => {});
    }
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  getState(): TTSState {
    return this.state;
  }

  isSpeaking(): boolean {
    return this.state === 'speaking';
  }

  isPaused(): boolean {
    return this.state === 'paused';
  }

  getCurrentSessionId(): string | null {
    return this.currentSession?.id ?? null;
  }

  /**
   * Get current text being spoken (for echo filtering)
   */
  getCurrentText(): string {
    return this.currentSession?.text ?? '';
  }

  /**
   * Get last spoken text (persists after stop for echo filtering)
   */
  getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  /**
   * Clear last spoken text (call when moving to next item)
   */
  clearLastSpokenText(): void {
    this.lastSpokenText = '';
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private registerEventListeners(): void {
    // TTS Start
    this.subscriptions.push(
      this.adapter.addEventListener('tts-start', (_event) => {
        if (!this.currentSession || this.isStopping) {
          return;
        }
        this.currentSession.onStart?.(this.currentSession.id);
      })
    );

    // TTS Progress - FIX: Now works for ALL sessions, not just 'standard' voice type
    this.subscriptions.push(
      this.adapter.addEventListener('tts-progress', (event) => {
        if (!this.currentSession || this.isStopping) {
          return;
        }

        const session = this.currentSession;
        const charIndex = event.location;

        // Update session state
        session.charIndex = charIndex;

        // Report progress on word boundaries to reduce UI flickering
        const isAtEnd = charIndex >= session.text.length;
        const charAtPosition = charIndex > 0 ? session.text[charIndex - 1] : '';
        const shouldReport = isAtEnd || isWordBoundary(charAtPosition);

        if (shouldReport && charIndex > session.lastReportedCharIndex) {
          session.lastReportedCharIndex = charIndex;

          // Find next word boundary for smoother highlighting
          const nextBoundary = findNextWordBoundary(session.text, charIndex);
          const wordInfo = getWordAtIndex(session.text, charIndex);

          const progressInfo: TTSProgressInfo = {
            charIndex: nextBoundary,
            totalLength: session.text.length,
            percentage: (charIndex / session.text.length) * 100,
            currentWord: wordInfo?.word,
            wordIndex: wordInfo?.wordIndex,
            totalWords: session.totalWords,
          };

          session.onProgress?.(progressInfo);
        }
      })
    );

    // TTS Finish
    this.subscriptions.push(
      this.adapter.addEventListener('tts-finish', () => {
        if (!this.currentSession || this.isStopping) {
          return;
        }

        const session = this.currentSession;

        // Report final progress
        if (session.onProgress) {
          session.onProgress({
            charIndex: session.text.length,
            totalLength: session.text.length,
            percentage: 100,
            wordIndex: session.totalWords - 1,
            totalWords: session.totalWords,
          });
        }

        // Clear session and call finish
        this.currentSession = null;
        this.state = 'idle';

        this.callFinishCallback(session, 'completed');
      })
    );

    // TTS Cancel
    this.subscriptions.push(
      this.adapter.addEventListener('tts-cancel', () => {
        if (!this.currentSession || this.isStopping) {
          return;
        }

        const session = this.currentSession;
        this.currentSession = null;
        this.state = 'idle';

        this.callFinishCallback(session, 'cancelled');
      })
    );

    // TTS Error
    this.subscriptions.push(
      this.adapter.addEventListener('tts-error', (event) => {
        if (!this.currentSession) {
          return;
        }

        const session = this.currentSession;
        this.currentSession = null;
        this.state = 'idle';

        this.handleError(event.error, session.id);
        this.callFinishCallback(session, 'error', event.error);
      })
    );
  }

  private callFinishCallback(
    session: TTSSession,
    status: TTSCompletionStatus,
    error?: string
  ): void {
    const finishInfo: TTSFinishInfo = {
      status,
      interruptInfo: session.interruptInfo,
      error,
      finalCharIndex: session.charIndex,
      durationMs: Date.now() - session.startTime,
      text: session.text,
    };

    session.onFinish?.(finishInfo);
  }

  private handleError(error: string, sessionId: string): void {
    const session = this.currentSession;
    if (session?.id === sessionId) {
      session.onError?.(error, sessionId);
    }
  }

  private resolveVoiceConfig(config?: VoiceConfig): TTSAdapterOptions | undefined {
    if (!config) {
      return undefined;
    }

    return {
      voiceId: config.voiceId,
      rate: config.rate,
      pitch: config.pitch,
      volume: config.volume,
    };
  }
}

/**
 * Create a TTSService instance
 */
export function createTTSService(adapter: ITTSAdapter): TTSService {
  return new TTSService(adapter);
}
