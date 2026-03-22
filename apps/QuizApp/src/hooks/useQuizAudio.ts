/**
 * useQuizAudio - Quiz-specific audio hook
 *
 * Wraps @monorepo/native-audio's useAudioCoordinator with quiz-specific
 * configuration and voice types.
 *
 * Features:
 * - Pre-configured stop triggers for quiz commands (buzz, stop, pause)
 * - Voice type mapping to native-audio voice profiles
 * - Automatic echo filtering during TTS playback
 * - Interrupt detection with finish status
 *
 * @example
 * ```typescript
 * const audio = useQuizAudio();
 *
 * // Read a question (voice recognition will filter echo automatically)
 * await audio.speak('What is the capital of France?');
 *
 * // Start listening for commands and answers
 * await audio.startListening();
 *
 * // Check if user buzzed in
 * useEffect(() => {
 *   if (audio.lastFinishInfo?.status === 'interrupted') {
 *     handleBuzz();
 *   }
 * }, [audio.lastFinishInfo]);
 * ```
 */

import { useMemo } from 'react';
import {
  useAudioCoordinator,
  type UseAudioCoordinatorReturn,
} from '@monorepo/native-audio';
import { getTTSAdapter } from '../adapters/TTSAdapter';
import { getVoiceAdapter } from '../adapters/VoiceAdapter';

/**
 * Quiz-specific stop triggers
 *
 * These words will interrupt TTS playback when detected via voice recognition.
 * Includes common misrecognitions (e.g., "bus" for "buzz").
 */
const QUIZ_STOP_TRIGGERS = [
  'buzz',
  'bus',
  'buz',
  'buds',
  'buzzer',
  'stop',
  'top',
  'stap',
  'pause',
  'paws',
  'pos',
];

/**
 * Additional preserved words that should bypass echo filtering
 * but aren't necessarily stop triggers (they're also commands)
 */
const QUIZ_PRESERVED_WORDS = ['quit', 'submit', 'next'];

/**
 * useQuizAudio hook options
 */
export interface UseQuizAudioOptions {
  /** Additional stop triggers beyond the defaults */
  additionalStopTriggers?: string[];
  /** Additional preserved words beyond the defaults */
  additionalPreservedWords?: string[];
  /** Echo filter threshold override (default 0.4) */
  echoFilterThreshold?: number;
}

/**
 * useQuizAudio hook return type
 * Extends UseAudioCoordinatorReturn with quiz-specific helpers
 */
export interface UseQuizAudioReturn extends UseAudioCoordinatorReturn {
  /** Whether a buzz was detected (convenience for lastFinishInfo.status === 'interrupted') */
  wasBuzzed: boolean;
  /** The specific trigger word that caused interruption */
  interruptTrigger: string | null;
}

/**
 * useQuizAudio hook
 *
 * Quiz-specific audio coordination with pre-configured triggers and preserved words.
 */
export function useQuizAudio(options?: UseQuizAudioOptions): UseQuizAudioReturn {
  // Get adapter singletons
  const ttsAdapter = useMemo(() => getTTSAdapter(), []);
  const voiceAdapter = useMemo(() => getVoiceAdapter(), []);

  // Combine stop triggers
  const stopTriggers = useMemo(
    () => [...QUIZ_STOP_TRIGGERS, ...(options?.additionalStopTriggers ?? [])],
    [options?.additionalStopTriggers]
  );

  // Combine preserved words
  const preservedWords = useMemo(
    () => [...QUIZ_PRESERVED_WORDS, ...(options?.additionalPreservedWords ?? [])],
    [options?.additionalPreservedWords]
  );

  // Use the generic audio coordinator
  const coordinator = useAudioCoordinator({
    ttsAdapter,
    voiceAdapter,
    stopTriggers,
    preservedWords,
    echoFilterThreshold: options?.echoFilterThreshold,
  });

  // Compute quiz-specific derived state
  const wasBuzzed =
    coordinator.lastFinishInfo?.status === 'interrupted' &&
    coordinator.lastFinishInfo?.interruptInfo?.trigger === 'stop_trigger';

  const interruptTrigger =
    coordinator.lastFinishInfo?.interruptInfo?.triggerMatch ?? null;

  return {
    ...coordinator,
    wasBuzzed,
    interruptTrigger,
  };
}
