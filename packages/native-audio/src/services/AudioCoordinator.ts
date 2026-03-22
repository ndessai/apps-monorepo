/**
 * AudioCoordinator - TTS and Voice Coordination
 *
 * High-level service that coordinates TTS and Voice recognition with:
 * - Automatic echo filter synchronization
 * - Stop trigger detection and TTS interruption
 * - Unified callback interface
 *
 * @example
 * ```typescript
 * const coordinator = new AudioCoordinator({
 *   ttsAdapter,
 *   voiceAdapter,
 *   stopTriggers: ['buzz', 'stop'],
 * });
 *
 * await coordinator.initialize();
 *
 * coordinator.setCallbacks({
 *   onTTSProgress: (info) => updateHighlight(info.charIndex),
 *   onTTSFinish: (info) => {
 *     if (info.status === 'interrupted') {
 *       handleBuzz();
 *     }
 *   },
 *   onVoiceResult: (result) => processAnswer(result.text),
 *   onStopTriggerDetected: (trigger) => console.log(`Trigger: ${trigger}`),
 * });
 *
 * await coordinator.speak('What is the capital of France?');
 * await coordinator.startListening();
 * ```
 */

import type { ITTSAdapter, IVoiceAdapter } from '../types/adapters';
import type {
  TTSProgressInfo,
  TTSFinishInfo,
  VoiceConfig,
} from '../types/tts';
import type { VoiceResult, VoiceListenConfig } from '../types/voice';
import { TTSService } from './TTSService';
import { VoiceService } from './VoiceService';
import { containsAnyWord } from '../utils/similarity';

/**
 * Configuration for the AudioCoordinator
 */
export interface AudioCoordinatorConfig {
  /** TTS adapter implementation */
  ttsAdapter: ITTSAdapter;
  /** Voice adapter implementation */
  voiceAdapter: IVoiceAdapter;
  /** Stop trigger words that should interrupt TTS */
  stopTriggers?: string[];
  /** Additional preserved words for voice recognition */
  preservedWords?: string[];
  /** Echo filter threshold override (default 0.4) */
  echoFilterThreshold?: number;
  /** Similarity threshold for stop trigger matching (default 0.7) */
  stopTriggerSimilarityThreshold?: number;
}

/**
 * Callbacks for audio events
 */
export interface AudioCoordinatorCallbacks {
  onTTSStart?: (sessionId: string) => void;
  onTTSProgress?: (info: TTSProgressInfo) => void;
  onTTSFinish?: (info: TTSFinishInfo) => void;
  onTTSError?: (error: string, sessionId: string) => void;
  onVoiceStart?: (sessionId: string) => void;
  onVoiceEnd?: (sessionId: string) => void;
  onVoiceResult?: (result: VoiceResult) => void;
  onVoicePartialResult?: (result: VoiceResult) => void;
  onVoiceError?: (error: string, sessionId: string) => void;
  onStopTriggerDetected?: (trigger: string) => void;
}

/**
 * Options for speaking
 */
export interface SpeakOptions {
  /** Voice configuration */
  voiceConfig?: VoiceConfig;
  /** Additional stop triggers for this speech */
  stopTriggers?: string[];
}

/**
 * AudioCoordinator class
 */
export class AudioCoordinator {
  private tts: TTSService;
  private voice: VoiceService;
  private config: Required<Omit<AudioCoordinatorConfig, 'ttsAdapter' | 'voiceAdapter'>>;
  private callbacks: AudioCoordinatorCallbacks = {};
  private isInitialized: boolean = false;

  constructor(config: AudioCoordinatorConfig) {
    this.tts = new TTSService(config.ttsAdapter);
    this.voice = new VoiceService(config.voiceAdapter);

    this.config = {
      stopTriggers: config.stopTriggers ?? [],
      preservedWords: config.preservedWords ?? [],
      echoFilterThreshold: config.echoFilterThreshold ?? 0.4,
      stopTriggerSimilarityThreshold: config.stopTriggerSimilarityThreshold ?? 0.7,
    };

    // Set up preserved words (stop triggers + additional preserved)
    const allPreserved = [
      ...this.config.stopTriggers,
      ...this.config.preservedWords,
    ];
    this.voice.setPreservedWords(allPreserved);
  }

  /**
   * Initialize both services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await Promise.all([this.tts.initialize(), this.voice.initialize()]);

    this.isInitialized = true;
  }

  /**
   * Set callbacks for audio events
   */
  setCallbacks(callbacks: AudioCoordinatorCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Speak text with automatic echo filter setup
   */
  async speak(text: string, options?: SpeakOptions): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Update voice service echo filter with TTS text
    this.voice.setEchoFilterText(text);

    // Combine stop triggers
    const allStopTriggers = [
      ...this.config.stopTriggers,
      ...(options?.stopTriggers ?? []),
    ];

    // Start TTS with callbacks
    return this.tts.speak({
      text,
      options: {
        voiceConfig: options?.voiceConfig,
        stopTriggers:
          allStopTriggers.length > 0
            ? {
                words: allStopTriggers,
                similarityThreshold: this.config.stopTriggerSimilarityThreshold,
              }
            : undefined,
      },
      onStart: (sessionId) => {
        this.callbacks.onTTSStart?.(sessionId);
      },
      onProgress: (info) => {
        this.callbacks.onTTSProgress?.(info);
      },
      onFinish: (info) => {
        this.callbacks.onTTSFinish?.(info);
      },
      onError: (error, sessionId) => {
        this.callbacks.onTTSError?.(error, sessionId);
      },
    });
  }

  /**
   * Stop TTS speaking
   */
  async stopSpeaking(reason: 'manual' | 'stop_trigger' = 'manual'): Promise<void> {
    await this.tts.stop(reason);
  }

  /**
   * Pause TTS speaking (iOS only)
   */
  async pauseSpeaking(): Promise<void> {
    await this.tts.pause();
  }

  /**
   * Resume TTS speaking (iOS only)
   */
  async resumeSpeaking(): Promise<void> {
    await this.tts.resume();
  }

  /**
   * Start listening with automatic echo filtering
   */
  async startListening(config?: Partial<VoiceListenConfig>): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Get current TTS text for echo filtering
    const echoFilterText =
      config?.echoFilterText ??
      (this.tts.getCurrentText() || this.tts.getLastSpokenText());

    return this.voice.startListening({
      config: {
        continuous: config?.continuous ?? true,
        locale: config?.locale,
        echoFilterText,
        echoFilterThreshold: config?.echoFilterThreshold ?? this.config.echoFilterThreshold,
        preservedWords: [
          ...this.config.stopTriggers,
          ...this.config.preservedWords,
          ...(config?.preservedWords ?? []),
        ],
        wordSimilarityThreshold: config?.wordSimilarityThreshold,
        minWordLength: config?.minWordLength,
        continuousRestartDelayMs: config?.continuousRestartDelayMs,
      },
      callbacks: {
        onStart: (sessionId) => {
          this.callbacks.onVoiceStart?.(sessionId);
        },
        onEnd: (sessionId) => {
          this.callbacks.onVoiceEnd?.(sessionId);
        },
        onResult: (result) => {
          // Check for stop triggers FIRST
          if (this.detectAndHandleStopTrigger(result.text)) {
            return;
          }
          this.callbacks.onVoiceResult?.(result);
        },
        onPartialResult: (result) => {
          // Also check partial results for faster trigger response
          if (this.detectAndHandleStopTrigger(result.text)) {
            return;
          }
          this.callbacks.onVoicePartialResult?.(result);
        },
        onError: (error, sessionId) => {
          this.callbacks.onVoiceError?.(error, sessionId);
        },
      },
    });
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    await this.voice.stopListening();
  }

  /**
   * Stop all audio (TTS and voice)
   */
  async stopAll(): Promise<void> {
    await Promise.all([this.tts.stop('manual'), this.voice.stopListening()]);
  }

  /**
   * Clean up both services
   */
  cleanup(): void {
    this.tts.cleanup();
    this.voice.cleanup();
    this.isInitialized = false;
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  isSpeaking(): boolean {
    return this.tts.isSpeaking();
  }

  isPaused(): boolean {
    return this.tts.isPaused();
  }

  isListening(): boolean {
    return this.voice.isListening();
  }

  getTTSSessionId(): string | null {
    return this.tts.getCurrentSessionId();
  }

  getVoiceSessionId(): string | null {
    return this.voice.getCurrentSessionId();
  }

  /**
   * Get current TTS text (for external use)
   */
  getCurrentTTSText(): string {
    return this.tts.getCurrentText() || this.tts.getLastSpokenText();
  }

  /**
   * Clear last spoken text (call when moving to next item)
   */
  clearLastSpokenText(): void {
    this.tts.clearLastSpokenText();
    this.voice.clearEchoFilter();
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Update stop triggers
   */
  setStopTriggers(triggers: string[]): void {
    this.config.stopTriggers = [...triggers];

    // Update voice preserved words
    const allPreserved = [...triggers, ...this.config.preservedWords];
    this.voice.setPreservedWords(allPreserved);
  }

  /**
   * Update preserved words
   */
  setPreservedWords(words: string[]): void {
    this.config.preservedWords = [...words];

    // Update voice preserved words
    const allPreserved = [...this.config.stopTriggers, ...words];
    this.voice.setPreservedWords(allPreserved);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Detect stop triggers and handle them
   * Returns true if a stop trigger was detected
   */
  private detectAndHandleStopTrigger(text: string): boolean {
    if (this.config.stopTriggers.length === 0 || !this.tts.isSpeaking()) {
      return false;
    }

    const match = containsAnyWord(
      text,
      this.config.stopTriggers,
      this.config.stopTriggerSimilarityThreshold
    );

    if (match.matches && match.matchedWord) {
      // Interrupt TTS
      this.tts.handleStopTrigger(match.matchedWord);

      // Notify callback
      this.callbacks.onStopTriggerDetected?.(match.matchedWord);

      return true;
    }

    return false;
  }
}

/**
 * Create an AudioCoordinator instance
 */
export function createAudioCoordinator(config: AudioCoordinatorConfig): AudioCoordinator {
  return new AudioCoordinator(config);
}
