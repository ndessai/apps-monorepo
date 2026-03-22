/**
 * Mock TTS Adapter for testing
 */

import type { ITTSAdapter, TTSAdapterOptions } from '../../types/adapters';
import type {
  VoiceInfo,
  TTSEventType,
  TTSStartEvent,
  TTSFinishEvent,
  TTSProgressEvent,
  TTSErrorEvent,
  TTSCancelEvent,
} from '../../types/tts';
import type { Subscription } from '../../types/common';

type TTSEventCallback =
  | ((event: TTSStartEvent) => void)
  | ((event: TTSFinishEvent) => void)
  | ((event: TTSProgressEvent) => void)
  | ((event: TTSErrorEvent) => void)
  | ((event: TTSCancelEvent) => void);

export class MockTTSAdapter implements ITTSAdapter {
  private listeners: Map<TTSEventType, Set<TTSEventCallback>> = new Map();
  private utteranceId = 0;
  private _isSpeaking = false;

  // Track method calls for assertions
  public speakCalls: Array<{ text: string; options?: TTSAdapterOptions }> = [];
  public stopCalls: number = 0;
  public pauseCalls: number = 0;
  public resumeCalls: number = 0;

  async speak(text: string, options?: TTSAdapterOptions): Promise<string> {
    this.speakCalls.push({ text, options });
    this._isSpeaking = true;
    const id = `utterance-${++this.utteranceId}`;

    // Emit start event asynchronously
    setTimeout(() => {
      this.emit('tts-start', { utteranceId: id });
    }, 0);

    return id;
  }

  async stop(): Promise<void> {
    this.stopCalls++;
    this._isSpeaking = false;
  }

  async pause(): Promise<void> {
    this.pauseCalls++;
  }

  async resume(): Promise<void> {
    this.resumeCalls++;
  }

  async isSpeaking(): Promise<boolean> {
    return this._isSpeaking;
  }

  async getVoices(): Promise<VoiceInfo[]> {
    return [
      { id: 'voice-1', name: 'Voice 1', language: 'en-US', quality: 300 },
      { id: 'voice-2', name: 'Voice 2', language: 'en-GB', quality: 500 },
    ];
  }

  async setDefaultVoice(_voiceId: string): Promise<void> {
    // No-op for mock
  }

  async setDefaultRate(_rate: number): Promise<void> {
    // No-op for mock
  }

  addEventListener<T extends TTSEventType>(
    event: T,
    callback: TTSEventCallback
  ): Subscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return {
      remove: () => {
        this.listeners.get(event)?.delete(callback);
      },
    };
  }

  removeAllListeners(event: TTSEventType): void {
    this.listeners.delete(event);
  }

  // Helper methods for tests to emit events
  emit<T extends TTSEventType>(
    event: T,
    data: T extends 'tts-progress'
      ? TTSProgressEvent
      : T extends 'tts-error'
        ? TTSErrorEvent
        : TTSStartEvent | TTSFinishEvent | TTSCancelEvent
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => (cb as (d: typeof data) => void)(data));
    }
  }

  emitProgress(utteranceId: string, location: number, length: number = 1): void {
    this.emit('tts-progress', { utteranceId, location, length });
  }

  emitFinish(utteranceId: string): void {
    this._isSpeaking = false;
    this.emit('tts-finish', { utteranceId });
  }

  emitCancel(utteranceId: string): void {
    this._isSpeaking = false;
    this.emit('tts-cancel', { utteranceId });
  }

  emitError(utteranceId: string, error: string): void {
    this._isSpeaking = false;
    this.emit('tts-error', { utteranceId, error });
  }

  // Reset mock state
  reset(): void {
    this.speakCalls = [];
    this.stopCalls = 0;
    this.pauseCalls = 0;
    this.resumeCalls = 0;
    this.listeners.clear();
    this._isSpeaking = false;
    this.utteranceId = 0;
  }
}
