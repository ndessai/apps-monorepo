/**
 * Adapter Interfaces for Native Modules
 *
 * The native-audio package uses dependency injection for native module access.
 * Apps implement these interfaces wrapping their native modules.
 *
 * Example (in QuizApp):
 * ```typescript
 * import { NativeTTS } from '../native/NativeTTS';
 * import type { ITTSAdapter } from '@monorepo/native-audio';
 *
 * export class TTSAdapter implements ITTSAdapter {
 *   speak(text: string, options?: TTSAdapterOptions): Promise<string> {
 *     return NativeTTS.speak(text, options);
 *   }
 *   // ... implement other methods
 * }
 * ```
 */

import type { Subscription } from './common';
import type {
  VoiceInfo,
  TTSEventType,
  TTSStartEvent,
  TTSFinishEvent,
  TTSProgressEvent,
  TTSErrorEvent,
  TTSCancelEvent,
  TTSPauseEvent,
  TTSResumeEvent,
} from './tts';
import type {
  VoiceEventType,
  VoiceStartEvent,
  VoiceResultEvent,
  VoiceEndEvent,
  VoiceErrorEvent,
  VoiceVolumeEvent,
} from './voice';

// ============================================================================
// TTS Adapter
// ============================================================================

/**
 * Options for TTS speak method
 */
export interface TTSAdapterOptions {
  /** Voice identifier to use */
  voiceId?: string;
  /** Speech rate (0.0 to 1.0) */
  rate?: number;
  /** Pitch multiplier (0.5 to 2.0) */
  pitch?: number;
  /** Volume (0.0 to 1.0) */
  volume?: number;
}

/**
 * TTS Adapter Interface
 *
 * Implement this interface to connect the native-audio package to your
 * native TTS module (e.g., react-native-tts, expo-speech, custom module).
 */
export interface ITTSAdapter {
  /**
   * Speak text with optional configuration
   * @param text - Text to speak
   * @param options - Optional TTS options
   * @returns Promise resolving to utterance ID
   */
  speak(text: string, options?: TTSAdapterOptions): Promise<string>;

  /**
   * Stop speaking immediately
   * @returns Promise resolving when stopped
   */
  stop(): Promise<void>;

  /**
   * Pause speaking (may not be supported on all platforms)
   * @returns Promise resolving when paused
   */
  pause(): Promise<void>;

  /**
   * Resume paused speech
   * @returns Promise resolving when resumed
   */
  resume(): Promise<void>;

  /**
   * Check if currently speaking
   * @returns Promise resolving to boolean
   */
  isSpeaking(): Promise<boolean>;

  /**
   * Get available voices
   * @returns Promise resolving to array of VoiceInfo
   */
  getVoices(): Promise<VoiceInfo[]>;

  /**
   * Set default voice for subsequent speak calls
   * @param voiceId - Voice identifier
   */
  setDefaultVoice(voiceId: string): Promise<void>;

  /**
   * Set default speech rate
   * @param rate - Rate from 0.0 to 1.0
   */
  setDefaultRate(rate: number): Promise<void>;

  /**
   * Add event listener for TTS events
   * @param event - Event type
   * @param callback - Callback function
   * @returns Subscription with remove() method
   */
  addEventListener<T extends TTSEventType>(
    event: T,
    callback: T extends 'tts-start'
      ? (event: TTSStartEvent) => void
      : T extends 'tts-finish'
        ? (event: TTSFinishEvent) => void
        : T extends 'tts-cancel'
          ? (event: TTSCancelEvent) => void
          : T extends 'tts-progress'
            ? (event: TTSProgressEvent) => void
            : T extends 'tts-error'
              ? (event: TTSErrorEvent) => void
              : T extends 'tts-pause'
                ? (event: TTSPauseEvent) => void
                : T extends 'tts-resume'
                  ? (event: TTSResumeEvent) => void
                  : never
  ): Subscription;

  /**
   * Remove all listeners for an event type
   * @param event - Event type
   */
  removeAllListeners(event: TTSEventType): void;
}

// ============================================================================
// Voice Adapter
// ============================================================================

/**
 * Options for Voice start method
 */
export interface VoiceAdapterOptions {
  /** Locale for speech recognition (e.g., "en-US") */
  locale?: string;
}

/**
 * Voice Adapter Interface
 *
 * Implement this interface to connect the native-audio package to your
 * native voice recognition module (e.g., @react-native-voice/voice, expo-speech).
 */
export interface IVoiceAdapter {
  /**
   * Request microphone and speech recognition permissions
   * @returns Promise resolving to boolean indicating if permissions granted
   */
  requestPermission(): Promise<boolean>;

  /**
   * Check if speech recognition is available
   * @returns Promise resolving to boolean
   */
  isAvailable(): Promise<boolean>;

  /**
   * Start speech recognition
   * @param options - Optional configuration
   * @returns Promise resolving to session ID
   */
  start(options?: VoiceAdapterOptions): Promise<string>;

  /**
   * Stop speech recognition gracefully (waits for final result)
   * @returns Promise resolving when stopped
   */
  stop(): Promise<void>;

  /**
   * Cancel speech recognition immediately (no final result)
   * @returns Promise resolving when cancelled
   */
  cancel(): Promise<void>;

  /**
   * Check if currently recognizing speech
   * @returns Promise resolving to boolean
   */
  isRecognizing(): Promise<boolean>;

  /**
   * Add event listener for voice events
   * @param event - Event type
   * @param callback - Callback function
   * @returns Subscription with remove() method
   */
  addEventListener<T extends VoiceEventType>(
    event: T,
    callback: T extends 'voice-start'
      ? (event: VoiceStartEvent) => void
      : T extends 'voice-result'
        ? (event: VoiceResultEvent) => void
        : T extends 'voice-end'
          ? (event: VoiceEndEvent) => void
          : T extends 'voice-error'
            ? (event: VoiceErrorEvent) => void
            : T extends 'voice-volume'
              ? (event: VoiceVolumeEvent) => void
              : never
  ): Subscription;

  /**
   * Remove all listeners for an event type
   * @param event - Event type
   */
  removeAllListeners(event: VoiceEventType): void;
}
