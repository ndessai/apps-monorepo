/**
 * useVoice - React hook for voice recognition
 *
 * Provides a React-friendly interface to the VoiceService.
 *
 * @example
 * ```typescript
 * const voice = useVoice(adapter);
 *
 * useEffect(() => {
 *   voice.startListening({ continuous: true });
 *   return () => voice.stopListening();
 * }, []);
 *
 * return (
 *   <View>
 *     <Text>Status: {voice.isListening ? 'Listening' : 'Idle'}</Text>
 *     <Text>Partial: {voice.partialResult?.text}</Text>
 *     <Text>Final: {voice.result?.text}</Text>
 *   </View>
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { IVoiceAdapter } from '../types/adapters';
import type { VoiceResult, VoiceListenConfig } from '../types/voice';
import { VoiceService } from '../services/VoiceService';

/**
 * Return type for useVoice hook
 */
export interface UseVoiceReturn {
  /** Start listening */
  startListening: (config?: VoiceListenConfig) => Promise<string>;
  /** Stop listening */
  stopListening: () => Promise<void>;
  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;
  /** Set echo filter text */
  setEchoFilterText: (text: string) => void;
  /** Clear echo filter */
  clearEchoFilter: () => void;
  /** Set preserved words */
  setPreservedWords: (words: string[]) => void;
  /** Whether currently listening */
  isListening: boolean;
  /** Last final result */
  result: VoiceResult | null;
  /** Last partial result */
  partialResult: VoiceResult | null;
  /** Last error */
  error: string | null;
  /** Current session ID */
  sessionId: string | null;
}

/**
 * useVoice hook
 */
export function useVoice(adapter: IVoiceAdapter): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [partialResult, setPartialResult] = useState<VoiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const serviceRef = useRef<VoiceService | null>(null);

  // Initialize service
  useEffect(() => {
    const service = new VoiceService(adapter);
    serviceRef.current = service;

    service.initialize().catch((err) => {
      console.error('[useVoice] Failed to initialize:', err);
    });

    return () => {
      service.cleanup();
      serviceRef.current = null;
    };
  }, [adapter]);

  const startListening = useCallback(
    async (config?: VoiceListenConfig): Promise<string> => {
      const service = serviceRef.current;
      if (!service) {
        throw new Error('Voice service not initialized');
      }

      // Reset state
      setError(null);
      setResult(null);
      setPartialResult(null);

      try {
        const id = await service.startListening({
          config: config ?? {},
          callbacks: {
            onStart: (sid) => {
              setSessionId(sid);
              setIsListening(true);
            },
            onEnd: () => {
              setIsListening(false);
            },
            onResult: (res) => {
              setResult(res);
              setPartialResult(null); // Clear partial when we get final
            },
            onPartialResult: (res) => {
              setPartialResult(res);
            },
            onError: (err) => {
              setError(err);
              setIsListening(false);
            },
          },
        });

        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setIsListening(false);
        throw err;
      }
    },
    []
  );

  const stopListening = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (service) {
      await service.stopListening();
      setIsListening(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const service = serviceRef.current;
    if (service) {
      return service.requestPermission();
    }
    return false;
  }, []);

  const setEchoFilterText = useCallback((text: string): void => {
    const service = serviceRef.current;
    if (service) {
      service.setEchoFilterText(text);
    }
  }, []);

  const clearEchoFilter = useCallback((): void => {
    const service = serviceRef.current;
    if (service) {
      service.clearEchoFilter();
    }
  }, []);

  const setPreservedWords = useCallback((words: string[]): void => {
    const service = serviceRef.current;
    if (service) {
      service.setPreservedWords(words);
    }
  }, []);

  return {
    startListening,
    stopListening,
    requestPermission,
    setEchoFilterText,
    clearEchoFilter,
    setPreservedWords,
    isListening,
    result,
    partialResult,
    error,
    sessionId,
  };
}
