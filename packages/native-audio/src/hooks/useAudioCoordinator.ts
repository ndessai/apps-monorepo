/**
 * useAudioCoordinator - React hook for coordinated TTS and voice recognition
 *
 * High-level hook that combines TTS and voice recognition with:
 * - Automatic echo filter synchronization
 * - Stop trigger detection and TTS interruption
 * - Unified state management
 *
 * @example
 * ```typescript
 * const audio = useAudioCoordinator({
 *   ttsAdapter,
 *   voiceAdapter,
 *   stopTriggers: ['buzz', 'stop'],
 * });
 *
 * useEffect(() => {
 *   audio.startListening();
 *   return () => audio.stopAll();
 * }, []);
 *
 * const handleReadQuestion = async (text: string) => {
 *   await audio.speak(text);
 * };
 *
 * // Check if reading was interrupted
 * useEffect(() => {
 *   if (audio.lastFinishInfo?.status === 'interrupted') {
 *     handleBuzz();
 *   }
 * }, [audio.lastFinishInfo]);
 *
 * return (
 *   <View>
 *     <Text>TTS: {audio.isSpeaking ? 'Speaking' : 'Idle'}</Text>
 *     <Text>Voice: {audio.isListening ? 'Listening' : 'Idle'}</Text>
 *     <Text>Progress: {audio.ttsProgress?.percentage}%</Text>
 *     <Text>Result: {audio.lastResult?.text}</Text>
 *   </View>
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ITTSAdapter, IVoiceAdapter } from '../types/adapters';
import type { TTSProgressInfo, TTSFinishInfo, VoiceConfig } from '../types/tts';
import type { VoiceResult, VoiceListenConfig } from '../types/voice';
import { AudioCoordinator } from '../services/AudioCoordinator';

/**
 * Configuration for the hook
 */
export interface UseAudioCoordinatorConfig {
  /** TTS adapter implementation */
  ttsAdapter: ITTSAdapter;
  /** Voice adapter implementation */
  voiceAdapter: IVoiceAdapter;
  /** Stop trigger words that should interrupt TTS */
  stopTriggers?: string[];
  /** Additional preserved words for voice recognition */
  preservedWords?: string[];
  /** Echo filter threshold override (default 0.4) */
  echoFilterThreshold?: number;
}

/**
 * Options for speaking
 */
export interface UseAudioSpeakOptions {
  voiceConfig?: VoiceConfig;
  stopTriggers?: string[];
}

/**
 * Return type for useAudioCoordinator hook
 */
export interface UseAudioCoordinatorReturn {
  // TTS controls
  speak: (text: string, options?: UseAudioSpeakOptions) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  pauseSpeaking: () => Promise<void>;
  resumeSpeaking: () => Promise<void>;

  // Voice controls
  startListening: (config?: Partial<VoiceListenConfig>) => Promise<void>;
  stopListening: () => Promise<void>;

  // Combined controls
  stopAll: () => Promise<void>;
  clearLastSpokenText: () => void;

  // Configuration
  setStopTriggers: (triggers: string[]) => void;
  setPreservedWords: (words: string[]) => void;

  // TTS state
  isSpeaking: boolean;
  isPaused: boolean;
  ttsProgress: TTSProgressInfo | null;
  lastFinishInfo: TTSFinishInfo | null;
  ttsError: string | null;
  currentTTSText: string;

  // Voice state
  isListening: boolean;
  lastResult: VoiceResult | null;
  partialResult: VoiceResult | null;
  voiceError: string | null;

  // Stop trigger state
  lastStopTrigger: string | null;
}

/**
 * useAudioCoordinator hook
 */
export function useAudioCoordinator(
  config: UseAudioCoordinatorConfig
): UseAudioCoordinatorReturn {
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsProgress, setTtsProgress] = useState<TTSProgressInfo | null>(null);
  const [lastFinishInfo, setLastFinishInfo] = useState<TTSFinishInfo | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [currentTTSText, setCurrentTTSText] = useState('');

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceResult | null>(null);
  const [partialResult, setPartialResult] = useState<VoiceResult | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Stop trigger state
  const [lastStopTrigger, setLastStopTrigger] = useState<string | null>(null);

  const coordinatorRef = useRef<AudioCoordinator | null>(null);

  // Initialize coordinator
  useEffect(() => {
    const coordinator = new AudioCoordinator({
      ttsAdapter: config.ttsAdapter,
      voiceAdapter: config.voiceAdapter,
      stopTriggers: config.stopTriggers,
      preservedWords: config.preservedWords,
      echoFilterThreshold: config.echoFilterThreshold,
    });

    coordinatorRef.current = coordinator;

    // Set up callbacks
    coordinator.setCallbacks({
      onTTSStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setLastFinishInfo(null);
        setTtsError(null);
      },
      onTTSProgress: (info) => {
        setTtsProgress(info);
      },
      onTTSFinish: (info) => {
        setLastFinishInfo(info);
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onTTSError: (err) => {
        setTtsError(err);
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onVoiceStart: () => {
        setIsListening(true);
        setVoiceError(null);
      },
      onVoiceEnd: () => {
        setIsListening(false);
      },
      onVoiceResult: (result) => {
        setLastResult(result);
        setPartialResult(null);
      },
      onVoicePartialResult: (result) => {
        setPartialResult(result);
      },
      onVoiceError: (err) => {
        setVoiceError(err);
        setIsListening(false);
      },
      onStopTriggerDetected: (trigger) => {
        setLastStopTrigger(trigger);
      },
    });

    coordinator.initialize().catch((err) => {
      console.error('[useAudioCoordinator] Failed to initialize:', err);
    });

    return () => {
      coordinator.cleanup();
      coordinatorRef.current = null;
    };
  }, [
    config.ttsAdapter,
    config.voiceAdapter,
    config.stopTriggers,
    config.preservedWords,
    config.echoFilterThreshold,
  ]);

  // TTS controls
  const speak = useCallback(
    async (text: string, options?: UseAudioSpeakOptions): Promise<void> => {
      const coordinator = coordinatorRef.current;
      if (!coordinator) {
        throw new Error('AudioCoordinator not initialized');
      }

      setCurrentTTSText(text);
      setTtsProgress(null);
      setLastStopTrigger(null);

      await coordinator.speak(text, options);
    },
    []
  );

  const stopSpeaking = useCallback(async (): Promise<void> => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      await coordinator.stopSpeaking();
    }
  }, []);

  const pauseSpeaking = useCallback(async (): Promise<void> => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      await coordinator.pauseSpeaking();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(async (): Promise<void> => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      await coordinator.resumeSpeaking();
      setIsPaused(false);
    }
  }, []);

  // Voice controls
  const startListening = useCallback(
    async (listenConfig?: Partial<VoiceListenConfig>): Promise<void> => {
      const coordinator = coordinatorRef.current;
      if (!coordinator) {
        throw new Error('AudioCoordinator not initialized');
      }

      setLastResult(null);
      setPartialResult(null);

      await coordinator.startListening(listenConfig);
    },
    []
  );

  const stopListening = useCallback(async (): Promise<void> => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      await coordinator.stopListening();
    }
  }, []);

  // Combined controls
  const stopAll = useCallback(async (): Promise<void> => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      await coordinator.stopAll();
    }
  }, []);

  const clearLastSpokenText = useCallback((): void => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      coordinator.clearLastSpokenText();
    }
    setCurrentTTSText('');
  }, []);

  // Configuration
  const setStopTriggers = useCallback((triggers: string[]): void => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      coordinator.setStopTriggers(triggers);
    }
  }, []);

  const setPreservedWords = useCallback((words: string[]): void => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      coordinator.setPreservedWords(words);
    }
  }, []);

  return {
    // TTS controls
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,

    // Voice controls
    startListening,
    stopListening,

    // Combined controls
    stopAll,
    clearLastSpokenText,

    // Configuration
    setStopTriggers,
    setPreservedWords,

    // TTS state
    isSpeaking,
    isPaused,
    ttsProgress,
    lastFinishInfo,
    ttsError,
    currentTTSText,

    // Voice state
    isListening,
    lastResult,
    partialResult,
    voiceError,

    // Stop trigger state
    lastStopTrigger,
  };
}
