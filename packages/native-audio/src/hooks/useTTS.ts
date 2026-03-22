/**
 * useTTS - React hook for text-to-speech
 *
 * Provides a React-friendly interface to the TTSService.
 *
 * @example
 * ```typescript
 * const tts = useTTS(adapter);
 *
 * const handleSpeak = async () => {
 *   await tts.speak('Hello world');
 * };
 *
 * return (
 *   <View>
 *     <Text>Progress: {tts.progress?.percentage}%</Text>
 *     <Button onPress={handleSpeak} disabled={tts.isSpeaking} />
 *     {tts.finishInfo?.status === 'interrupted' && (
 *       <Text>Interrupted!</Text>
 *     )}
 *   </View>
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ITTSAdapter } from '../types/adapters';
import type { TTSProgressInfo, TTSFinishInfo, VoiceConfig, StopTriggerConfig } from '../types/tts';
import { TTSService } from '../services/TTSService';

/**
 * Options for speaking
 */
export interface UseTTSSpeakOptions {
  voiceConfig?: VoiceConfig;
  stopTriggers?: StopTriggerConfig;
}

/**
 * Return type for useTTS hook
 */
export interface UseTTSReturn {
  /** Speak text */
  speak: (text: string, options?: UseTTSSpeakOptions) => Promise<string>;
  /** Stop speaking */
  stop: () => Promise<void>;
  /** Pause speaking (iOS only) */
  pause: () => Promise<void>;
  /** Resume speaking (iOS only) */
  resume: () => Promise<void>;
  /** Handle external stop trigger */
  handleStopTrigger: (triggerWord: string) => void;
  /** Whether currently speaking */
  isSpeaking: boolean;
  /** Whether currently paused */
  isPaused: boolean;
  /** Current progress info */
  progress: TTSProgressInfo | null;
  /** Last finish info */
  finishInfo: TTSFinishInfo | null;
  /** Last error */
  error: string | null;
  /** Current session ID */
  sessionId: string | null;
  /** Current text being spoken */
  currentText: string;
  /** Last spoken text (persists after stop) */
  lastSpokenText: string;
  /** Clear last spoken text */
  clearLastSpokenText: () => void;
}

/**
 * useTTS hook
 */
export function useTTS(adapter: ITTSAdapter): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<TTSProgressInfo | null>(null);
  const [finishInfo, setFinishInfo] = useState<TTSFinishInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');

  const serviceRef = useRef<TTSService | null>(null);

  // Initialize service
  useEffect(() => {
    const service = new TTSService(adapter);
    serviceRef.current = service;

    service.initialize().catch((err) => {
      console.error('[useTTS] Failed to initialize:', err);
    });

    return () => {
      service.cleanup();
      serviceRef.current = null;
    };
  }, [adapter]);

  const speak = useCallback(
    async (text: string, options?: UseTTSSpeakOptions): Promise<string> => {
      const service = serviceRef.current;
      if (!service) {
        throw new Error('TTS service not initialized');
      }

      // Reset state
      setError(null);
      setFinishInfo(null);
      setProgress(null);
      setCurrentText(text);

      try {
        const id = await service.speak({
          text,
          options: {
            voiceConfig: options?.voiceConfig,
            stopTriggers: options?.stopTriggers,
          },
          onStart: (sid) => {
            setSessionId(sid);
            setIsSpeaking(true);
            setIsPaused(false);
          },
          onProgress: (info) => {
            setProgress(info);
          },
          onFinish: (info) => {
            setFinishInfo(info);
            setIsSpeaking(false);
            setIsPaused(false);
            setLastSpokenText(text);
          },
          onError: (err) => {
            setError(err);
            setIsSpeaking(false);
            setIsPaused(false);
          },
        });

        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setIsSpeaking(false);
        throw err;
      }
    },
    []
  );

  const stop = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (service) {
      await service.stop('manual');
    }
  }, []);

  const pause = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (service) {
      await service.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (service) {
      await service.resume();
      setIsPaused(false);
    }
  }, []);

  const handleStopTrigger = useCallback((triggerWord: string): void => {
    const service = serviceRef.current;
    if (service) {
      service.handleStopTrigger(triggerWord);
    }
  }, []);

  const clearLastSpokenText = useCallback((): void => {
    setLastSpokenText('');
    const service = serviceRef.current;
    if (service) {
      service.clearLastSpokenText();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    handleStopTrigger,
    isSpeaking,
    isPaused,
    progress,
    finishInfo,
    error,
    sessionId,
    currentText,
    lastSpokenText,
    clearLastSpokenText,
  };
}
