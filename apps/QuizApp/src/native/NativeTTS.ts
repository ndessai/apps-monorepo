/**
 * NativeTTS - TypeScript wrapper for custom native TTS module
 *
 * Provides type-safe access to AVSpeechSynthesizer (iOS) and TextToSpeech (Android)
 * through a unified JavaScript interface.
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { NativeTTS: NativeTTSModule } = NativeModules;

if (!NativeTTSModule) {
  throw new Error(
    'NativeTTS native module not found. Make sure you have rebuilt the app after adding the native module.'
  );
}

// Types

export interface TTSOptions {
  /** Voice identifier to use for this utterance */
  voiceId?: string;
  /** Speech rate (0.0 to 1.0, normalized) */
  rate?: number;
  /** Pitch multiplier (0.5 to 2.0) */
  pitch?: number;
  /** Volume (0.0 to 1.0) */
  volume?: number;
}

export interface Voice {
  /** Unique identifier for the voice */
  id: string;
  /** Display name of the voice */
  name: string;
  /** Language code (e.g., "en-US") */
  language: string;
  /** Quality rating (300 = normal, 500 = enhanced, 600 = premium) */
  quality: number;
  /** Whether network is required (Android only) */
  isNetworkRequired?: boolean;
}

export interface TTSProgressEvent {
  /** Identifier of the utterance */
  utteranceId: string;
  /** Character position in the text */
  location: number;
  /** Length of the current word/segment */
  length: number;
}

export interface TTSEvent {
  /** Identifier of the utterance */
  utteranceId: string;
}

export interface TTSErrorEvent extends TTSEvent {
  /** Error message */
  error: string;
}

// Event types
export type TTSEventType =
  | 'tts-start'
  | 'tts-finish'
  | 'tts-cancel'
  | 'tts-progress'
  | 'tts-error'
  | 'tts-pause'
  | 'tts-resume';

// Create event emitter
const eventEmitter = new NativeEventEmitter(NativeTTSModule);

/**
 * NativeTTS API
 *
 * Usage:
 * ```typescript
 * import { NativeTTS } from '../native/NativeTTS';
 *
 * // Speak text
 * const utteranceId = await NativeTTS.speak('Hello world');
 *
 * // Listen to progress
 * const subscription = NativeTTS.addEventListener('tts-progress', (event) => {
 *   console.log(`Character position: ${event.location}`);
 * });
 *
 * // Stop speaking
 * await NativeTTS.stop();
 *
 * // Cleanup
 * subscription.remove();
 * ```
 */
export const NativeTTS = {
  /**
   * Speak text with optional configuration
   * @param text - Text to speak
   * @param options - Optional TTS options (voice, rate, pitch, volume)
   * @returns Promise resolving to utterance ID
   */
  speak: (text: string, options: TTSOptions = {}): Promise<string> => {
    return NativeTTSModule.speak(text, options);
  },

  /**
   * Stop speaking immediately
   * @returns Promise resolving to boolean indicating success
   */
  stop: (): Promise<boolean> => {
    return NativeTTSModule.stop();
  },

  /**
   * Pause speaking (iOS only)
   * @returns Promise resolving to boolean indicating success
   */
  pause: (): Promise<boolean> => {
    return NativeTTSModule.pause();
  },

  /**
   * Resume paused speech (iOS only)
   * @returns Promise resolving to boolean indicating success
   */
  resume: (): Promise<boolean> => {
    return NativeTTSModule.resume();
  },

  /**
   * Check if currently speaking
   * @returns Promise resolving to boolean
   */
  isSpeaking: (): Promise<boolean> => {
    return NativeTTSModule.isSpeaking();
  },

  /**
   * Get available voices
   * @returns Promise resolving to array of Voice objects
   */
  getVoices: (): Promise<Voice[]> => {
    return NativeTTSModule.getVoices();
  },

  /**
   * Set default voice for subsequent speak calls
   * @param voiceId - Voice identifier
   * @returns Promise resolving when complete
   */
  setDefaultVoice: (voiceId: string): Promise<void> => {
    return NativeTTSModule.setDefaultVoice(voiceId);
  },

  /**
   * Set default speech rate
   * @param rate - Rate from 0.0 (slowest) to 1.0 (fastest)
   * @returns Promise resolving when complete
   */
  setDefaultRate: (rate: number): Promise<void> => {
    return NativeTTSModule.setDefaultRate(rate);
  },

  /**
   * Set default pitch
   * @param pitch - Pitch multiplier from 0.5 to 2.0
   * @returns Promise resolving when complete
   */
  setDefaultPitch: (pitch: number): Promise<void> => {
    return NativeTTSModule.setDefaultPitch(pitch);
  },

  /**
   * Set default language
   * @param language - Language code (e.g., "en-US")
   * @returns Promise resolving when complete
   */
  setDefaultLanguage: (language: string): Promise<void> => {
    return NativeTTSModule.setDefaultLanguage(language);
  },

  /**
   * Add event listener for TTS events
   * @param event - Event type to listen for
   * @param callback - Callback function
   * @returns Subscription object with remove() method
   */
  addEventListener: <T extends TTSEventType>(
    event: T,
    callback: (
      data: T extends 'tts-progress'
        ? TTSProgressEvent
        : T extends 'tts-error'
          ? TTSErrorEvent
          : TTSEvent
    ) => void
  ) => {
    return eventEmitter.addListener(event, callback);
  },

  /**
   * Remove all listeners for an event
   * @param event - Event type to remove listeners for
   */
  removeAllListeners: (event: TTSEventType) => {
    eventEmitter.removeAllListeners(event);
  },
};

export default NativeTTS;
