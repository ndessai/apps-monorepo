/**
 * NativeVoice - TypeScript wrapper for custom native Voice Recognition module
 *
 * Provides type-safe access to:
 * - SFSpeechRecognizer (iOS)
 * - SpeechRecognizer (Android)
 * through a unified JavaScript interface.
 */

import { NativeModules, NativeEventEmitter } from 'react-native';

const { NativeVoice: NativeVoiceModule } = NativeModules;

if (!NativeVoiceModule) {
  throw new Error(
    'NativeVoice native module not found. Make sure you have rebuilt the app after adding the native module.'
  );
}

// Types

export interface VoiceOptions {
  /** Locale for speech recognition (e.g., "en-US") */
  locale?: string;
}

export interface VoiceStartEvent {
  /** Session identifier for this recognition session */
  sessionId: string;
}

export interface VoiceResultEvent {
  /** Session identifier */
  sessionId: string;
  /** Recognized text */
  text: string;
  /** Whether this is the final result (recognition complete) */
  isFinal: boolean;
}

export interface VoiceEndEvent {
  /** Session identifier */
  sessionId: string;
}

export interface VoiceErrorEvent {
  /** Session identifier */
  sessionId: string;
  /** Error message */
  error: string;
  /** Error code */
  code: number;
}

export interface VoiceVolumeEvent {
  /** Session identifier */
  sessionId: string;
  /** Audio volume level (0.0 to 1.0) */
  volume: number;
}

// Event types
export type VoiceEventType =
  | 'voice-start'
  | 'voice-result'
  | 'voice-end'
  | 'voice-error'
  | 'voice-volume';

// Create event emitter
const eventEmitter = new NativeEventEmitter(NativeVoiceModule);

/**
 * NativeVoice API
 *
 * Usage:
 * ```typescript
 * import { NativeVoice } from '../native/NativeVoice';
 *
 * // Request permission first
 * const granted = await NativeVoice.requestPermission();
 *
 * // Start listening
 * const sessionId = await NativeVoice.start({ locale: 'en-US' });
 *
 * // Listen to results
 * const subscription = NativeVoice.addEventListener('voice-result', (event) => {
 *   console.log(`Recognized: ${event.text}, final: ${event.isFinal}`);
 * });
 *
 * // Stop listening
 * await NativeVoice.stop();
 *
 * // Cleanup
 * subscription.remove();
 * ```
 */
export const NativeVoice = {
  /**
   * Request microphone and speech recognition permissions
   * @returns Promise resolving to boolean indicating if permissions were granted
   */
  requestPermission: (): Promise<boolean> => {
    return NativeVoiceModule.requestPermission();
  },

  /**
   * Check if speech recognition is available and authorized
   * @returns Promise resolving to boolean
   */
  isAvailable: (): Promise<boolean> => {
    return NativeVoiceModule.isAvailable();
  },

  /**
   * Start speech recognition
   * @param options - Optional configuration (locale)
   * @returns Promise resolving to session ID
   */
  start: (options: VoiceOptions = {}): Promise<string> => {
    return NativeVoiceModule.start(options);
  },

  /**
   * Stop speech recognition gracefully (waits for final result)
   * @returns Promise resolving when stopped
   */
  stop: (): Promise<void> => {
    return NativeVoiceModule.stop();
  },

  /**
   * Cancel speech recognition immediately (no final result)
   * @returns Promise resolving when cancelled
   */
  cancel: (): Promise<void> => {
    return NativeVoiceModule.cancel();
  },

  /**
   * Check if currently recognizing speech
   * @returns Promise resolving to boolean
   */
  isRecognizing: (): Promise<boolean> => {
    return NativeVoiceModule.isRecognizing();
  },

  /**
   * Add event listener for voice events
   * @param event - Event type to listen for
   * @param callback - Callback function
   * @returns Subscription object with remove() method
   */
  addEventListener: <T extends VoiceEventType>(
    event: T,
    callback: (
      data: T extends 'voice-start'
        ? VoiceStartEvent
        : T extends 'voice-result'
          ? VoiceResultEvent
          : T extends 'voice-end'
            ? VoiceEndEvent
            : T extends 'voice-error'
              ? VoiceErrorEvent
              : T extends 'voice-volume'
                ? VoiceVolumeEvent
                : never
    ) => void
  ) => {
    return eventEmitter.addListener(event, callback);
  },

  /**
   * Remove all listeners for an event
   * @param event - Event type to remove listeners for
   */
  removeAllListeners: (event: VoiceEventType) => {
    eventEmitter.removeAllListeners(event);
  },
};

export default NativeVoice;
