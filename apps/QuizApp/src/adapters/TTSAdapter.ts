/**
 * TTS Adapter for QuizApp
 *
 * Implements ITTSAdapter from @monorepo/native-audio by wrapping
 * the existing NativeTTS native module.
 */

import type {
  ITTSAdapter,
  TTSAdapterOptions,
  VoiceInfo,
  TTSEventType,
  TTSStartEvent,
  TTSFinishEvent,
  TTSProgressEvent,
  TTSErrorEvent,
  TTSCancelEvent,
  TTSPauseEvent,
  TTSResumeEvent,
  Subscription,
} from '@monorepo/native-audio';
import { NativeTTS, Voice } from '../native/NativeTTS';

/**
 * Maps NativeTTS Voice to VoiceInfo
 */
function mapVoice(voice: Voice): VoiceInfo {
  return {
    id: voice.id,
    name: voice.name,
    language: voice.language,
    quality: voice.quality,
    isNetworkRequired: voice.isNetworkRequired,
  };
}

/**
 * TTSAdapter class
 *
 * Wraps NativeTTS for use with @monorepo/native-audio
 */
export class TTSAdapter implements ITTSAdapter {
  async speak(text: string, options?: TTSAdapterOptions): Promise<string> {
    return NativeTTS.speak(text, {
      voiceId: options?.voiceId,
      rate: options?.rate,
      pitch: options?.pitch,
      volume: options?.volume,
    });
  }

  async stop(): Promise<void> {
    await NativeTTS.stop();
  }

  async pause(): Promise<void> {
    await NativeTTS.pause();
  }

  async resume(): Promise<void> {
    await NativeTTS.resume();
  }

  async isSpeaking(): Promise<boolean> {
    return NativeTTS.isSpeaking();
  }

  async getVoices(): Promise<VoiceInfo[]> {
    const voices = await NativeTTS.getVoices();
    return voices.map(mapVoice);
  }

  async setDefaultVoice(voiceId: string): Promise<void> {
    await NativeTTS.setDefaultVoice(voiceId);
  }

  async setDefaultRate(rate: number): Promise<void> {
    await NativeTTS.setDefaultRate(rate);
  }

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
  ): Subscription {
    // NativeTTS.addEventListener returns a subscription-like object
    const subscription = NativeTTS.addEventListener(event, callback as any);
    return {
      remove: () => subscription.remove(),
    };
  }

  removeAllListeners(event: TTSEventType): void {
    NativeTTS.removeAllListeners(event);
  }
}

/**
 * Singleton instance for convenience
 */
let ttsAdapterInstance: TTSAdapter | null = null;

export function getTTSAdapter(): TTSAdapter {
  if (!ttsAdapterInstance) {
    ttsAdapterInstance = new TTSAdapter();
  }
  return ttsAdapterInstance;
}
