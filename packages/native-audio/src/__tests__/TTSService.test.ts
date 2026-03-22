/**
 * TTSService unit tests
 */

import { TTSService } from '../services/TTSService';
import { MockTTSAdapter } from './__mocks__/mockTTSAdapter';

describe('TTSService', () => {
  let adapter: MockTTSAdapter;
  let service: TTSService;

  beforeEach(async () => {
    adapter = new MockTTSAdapter();
    service = new TTSService(adapter);
    await service.initialize();
  });

  afterEach(() => {
    service.cleanup();
    adapter.reset();
  });

  describe('speak', () => {
    it('should return session ID', async () => {
      const sessionId = await service.speak({ text: 'Hello world' });
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('should call adapter.speak with text', async () => {
      await service.speak({ text: 'Hello world' });
      expect(adapter.speakCalls.length).toBe(1);
      expect(adapter.speakCalls[0].text).toBe('Hello world');
    });

    it('should pass voice config to adapter', async () => {
      await service.speak({
        text: 'Hello world',
        options: {
          voiceConfig: { voiceId: 'voice-1', rate: 0.5 },
        },
      });

      expect(adapter.speakCalls[0].options).toEqual({
        voiceId: 'voice-1',
        rate: 0.5,
        pitch: undefined,
        volume: undefined,
      });
    });

    it('should update state to speaking', async () => {
      expect(service.isSpeaking()).toBe(false);
      await service.speak({ text: 'Hello world' });
      expect(service.isSpeaking()).toBe(true);
    });

    it('should track current text for echo filtering', async () => {
      await service.speak({ text: 'What is the capital?' });
      expect(service.getCurrentText()).toBe('What is the capital?');
    });
  });

  describe('progress callbacks', () => {
    it('should call onProgress when progress events received', async () => {
      const progressUpdates: number[] = [];

      await service.speak({
        text: 'Hello world test',
        onProgress: (info) => progressUpdates.push(info.charIndex),
      });

      // Wait for async start event
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Emit progress events (on word boundaries)
      adapter.emitProgress('utterance-1', 5); // After "Hello"
      adapter.emitProgress('utterance-1', 11); // After "world"

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('should work for ALL voice types (not just standard)', async () => {
      const progressUpdates: number[] = [];

      await service.speak({
        text: 'Hello world',
        options: {
          voiceConfig: { voiceId: 'custom-voice' },
        },
        onProgress: (info) => progressUpdates.push(info.charIndex),
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Emit progress - should work regardless of voice type
      adapter.emitProgress('utterance-1', 5);

      expect(progressUpdates.length).toBeGreaterThan(0);
    });
  });

  describe('finish callbacks with interrupt status', () => {
    it('should report completed status when TTS finishes naturally', async () => {
      let finishInfo: any = null;

      await service.speak({
        text: 'Hello world',
        onFinish: (info) => {
          finishInfo = info;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Emit finish event
      adapter.emitFinish('utterance-1');

      expect(finishInfo).not.toBeNull();
      expect(finishInfo.status).toBe('completed');
      expect(finishInfo.interruptInfo).toBeUndefined();
    });

    it('should report interrupted status when stop is called', async () => {
      let finishInfo: any = null;

      await service.speak({
        text: 'Hello world',
        onFinish: (info) => {
          finishInfo = info;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Stop manually
      await service.stop('manual');

      expect(finishInfo).not.toBeNull();
      expect(finishInfo.status).toBe('interrupted');
      expect(finishInfo.interruptInfo?.trigger).toBe('manual_stop');
    });

    it('should report stop_trigger when handleStopTrigger is called', async () => {
      let finishInfo: any = null;

      await service.speak({
        text: 'Hello world',
        options: {
          stopTriggers: { words: ['buzz'] },
        },
        onFinish: (info) => {
          finishInfo = info;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Trigger stop via voice command
      service.handleStopTrigger('buzz');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(finishInfo).not.toBeNull();
      expect(finishInfo.status).toBe('interrupted');
      expect(finishInfo.interruptInfo?.trigger).toBe('stop_trigger');
      expect(finishInfo.interruptInfo?.triggerMatch).toBe('buzz');
    });

    it('should include duration in finish info', async () => {
      let finishInfo: any = null;

      await service.speak({
        text: 'Hello world',
        onFinish: (info) => {
          finishInfo = info;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      adapter.emitFinish('utterance-1');

      expect(finishInfo.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should report error status on TTS error', async () => {
      let finishInfo: any = null;

      await service.speak({
        text: 'Hello world',
        onFinish: (info) => {
          finishInfo = info;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      adapter.emitError('utterance-1', 'Test error');

      expect(finishInfo).not.toBeNull();
      expect(finishInfo.status).toBe('error');
      expect(finishInfo.error).toBe('Test error');
    });
  });

  describe('stop', () => {
    it('should call adapter.stop', async () => {
      await service.speak({ text: 'Hello world' });
      await service.stop();

      expect(adapter.stopCalls).toBe(1);
    });

    it('should update state to idle', async () => {
      await service.speak({ text: 'Hello world' });
      expect(service.isSpeaking()).toBe(true);

      await service.stop();
      expect(service.isSpeaking()).toBe(false);
    });
  });

  describe('pause and resume', () => {
    it('should call adapter.pause', async () => {
      await service.speak({ text: 'Hello world' });
      await service.pause();

      expect(adapter.pauseCalls).toBe(1);
      expect(service.isPaused()).toBe(true);
    });

    it('should call adapter.resume', async () => {
      await service.speak({ text: 'Hello world' });
      await service.pause();
      await service.resume();

      expect(adapter.resumeCalls).toBe(1);
      expect(service.isPaused()).toBe(false);
    });
  });

  describe('lastSpokenText', () => {
    it('should persist text after TTS finishes', async () => {
      await service.speak({
        text: 'What is the capital?',
        onFinish: () => {},
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      adapter.emitFinish('utterance-1');

      expect(service.getLastSpokenText()).toBe('What is the capital?');
    });

    it('should be clearable', async () => {
      await service.speak({ text: 'Hello' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      adapter.emitFinish('utterance-1');

      service.clearLastSpokenText();
      expect(service.getLastSpokenText()).toBe('');
    });
  });

  describe('session management', () => {
    it('should stop previous session when speaking again', async () => {
      await service.speak({ text: 'First text' });
      await service.speak({ text: 'Second text' });

      // Should have called stop for the first session
      expect(adapter.stopCalls).toBeGreaterThanOrEqual(1);
    });

    it('should track current session ID', async () => {
      expect(service.getCurrentSessionId()).toBeNull();

      await service.speak({ text: 'Hello' });
      expect(service.getCurrentSessionId()).not.toBeNull();
    });
  });
});
