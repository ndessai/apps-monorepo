/**
 * Voice Adapter for QuizApp
 *
 * Implements IVoiceAdapter from @monorepo/native-audio by wrapping
 * the existing NativeVoice native module.
 */

import type {
  IVoiceAdapter,
  VoiceAdapterOptions,
  VoiceEventType,
  VoiceStartEvent,
  VoiceResultEvent,
  VoiceEndEvent,
  VoiceErrorEvent,
  VoiceVolumeEvent,
  Subscription,
} from '@monorepo/native-audio';
import { NativeVoice } from '../native/NativeVoice';

/**
 * VoiceAdapter class
 *
 * Wraps NativeVoice for use with @monorepo/native-audio
 */
export class VoiceAdapter implements IVoiceAdapter {
  async requestPermission(): Promise<boolean> {
    return NativeVoice.requestPermission();
  }

  async isAvailable(): Promise<boolean> {
    return NativeVoice.isAvailable();
  }

  async start(options?: VoiceAdapterOptions): Promise<string> {
    return NativeVoice.start({
      locale: options?.locale,
    });
  }

  async stop(): Promise<void> {
    await NativeVoice.stop();
  }

  async cancel(): Promise<void> {
    await NativeVoice.cancel();
  }

  async isRecognizing(): Promise<boolean> {
    return NativeVoice.isRecognizing();
  }

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
  ): Subscription {
    // NativeVoice.addEventListener returns a subscription-like object
    const subscription = NativeVoice.addEventListener(event, callback as any);
    return {
      remove: () => subscription.remove(),
    };
  }

  removeAllListeners(event: VoiceEventType): void {
    NativeVoice.removeAllListeners(event);
  }
}

/**
 * Singleton instance for convenience
 */
let voiceAdapterInstance: VoiceAdapter | null = null;

export function getVoiceAdapter(): VoiceAdapter {
  if (!voiceAdapterInstance) {
    voiceAdapterInstance = new VoiceAdapter();
  }
  return voiceAdapterInstance;
}
