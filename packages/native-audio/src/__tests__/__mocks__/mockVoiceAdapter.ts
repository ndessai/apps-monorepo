/**
 * Mock Voice Adapter for testing
 */

import type { IVoiceAdapter, VoiceAdapterOptions } from '../../types/adapters';
import type {
  VoiceEventType,
  VoiceStartEvent,
  VoiceResultEvent,
  VoiceEndEvent,
  VoiceErrorEvent,
  VoiceVolumeEvent,
} from '../../types/voice';
import type { Subscription } from '../../types/common';

type VoiceEventCallback =
  | ((event: VoiceStartEvent) => void)
  | ((event: VoiceResultEvent) => void)
  | ((event: VoiceEndEvent) => void)
  | ((event: VoiceErrorEvent) => void)
  | ((event: VoiceVolumeEvent) => void);

export class MockVoiceAdapter implements IVoiceAdapter {
  private listeners: Map<VoiceEventType, Set<VoiceEventCallback>> = new Map();
  private sessionId = 0;
  private _isRecognizing = false;

  // Track method calls for assertions
  public startCalls: Array<{ options?: VoiceAdapterOptions }> = [];
  public stopCalls: number = 0;
  public cancelCalls: number = 0;
  public permissionRequests: number = 0;

  // Control permission behavior
  public permissionGranted: boolean = true;
  public isAvailableResult: boolean = true;

  async requestPermission(): Promise<boolean> {
    this.permissionRequests++;
    return this.permissionGranted;
  }

  async isAvailable(): Promise<boolean> {
    return this.isAvailableResult;
  }

  async start(options?: VoiceAdapterOptions): Promise<string> {
    this.startCalls.push({ options });
    this._isRecognizing = true;
    const id = `voice-session-${++this.sessionId}`;

    // Emit start event asynchronously
    setTimeout(() => {
      this.emit('voice-start', { sessionId: id });
    }, 0);

    return id;
  }

  async stop(): Promise<void> {
    this.stopCalls++;
    this._isRecognizing = false;
  }

  async cancel(): Promise<void> {
    this.cancelCalls++;
    this._isRecognizing = false;
  }

  async isRecognizing(): Promise<boolean> {
    return this._isRecognizing;
  }

  addEventListener<T extends VoiceEventType>(
    event: T,
    callback: VoiceEventCallback
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

  removeAllListeners(event: VoiceEventType): void {
    this.listeners.delete(event);
  }

  // Helper methods for tests to emit events
  emit<T extends VoiceEventType>(
    event: T,
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
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => (cb as (d: typeof data) => void)(data));
    }
  }

  emitResult(sessionId: string, text: string, isFinal: boolean): void {
    this.emit('voice-result', { sessionId, text, isFinal });
  }

  emitEnd(sessionId: string): void {
    this._isRecognizing = false;
    this.emit('voice-end', { sessionId });
  }

  emitError(sessionId: string, error: string, code: number): void {
    this._isRecognizing = false;
    this.emit('voice-error', { sessionId, error, code });
  }

  emitVolume(sessionId: string, volume: number): void {
    this.emit('voice-volume', { sessionId, volume });
  }

  // Get current session ID for testing
  getCurrentSessionId(): string {
    return `voice-session-${this.sessionId}`;
  }

  // Reset mock state
  reset(): void {
    this.startCalls = [];
    this.stopCalls = 0;
    this.cancelCalls = 0;
    this.permissionRequests = 0;
    this.listeners.clear();
    this._isRecognizing = false;
    this.sessionId = 0;
    this.permissionGranted = true;
    this.isAvailableResult = true;
  }
}
