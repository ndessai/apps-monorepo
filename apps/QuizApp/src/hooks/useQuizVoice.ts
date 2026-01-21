/**
 * useQuizVoice Hook
 *
 * Custom React hook for managing voice recognition in QuizScreen.
 * This hook owns the voice service lifecycle and uses the pure classifier
 * from audioActionsService to determine actions from speech.
 *
 * Key responsibilities:
 * - Start/stop voice recognition based on quiz state
 * - Apply TTS echo filtering during question reading
 * - Classify speech into actions (interrupt, answer, pause, stop, quit)
 * - Provide clean interface to QuizScreen
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as voiceService from '../services/nativeVoiceService';
import { classifyAction, containsCommandWord } from '../services/audioActionsService';
import type {
  QuestionTypeKey,
  AudioActionResult,
  AudioActionContext,
} from '../types/quizFormat';
import type { QuizMode } from '../types/quiz';

export interface UseQuizVoiceOptions {
  enabled: boolean;
  questionType: QuestionTypeKey;
  quizMode: QuizMode;
  isReading: boolean;
  questionText?: string;
  onAction: (action: AudioActionResult) => void;
  onError?: (error: string) => void;
}

export interface UseQuizVoiceReturn {
  isListening: boolean;
  startListening: () => Promise<boolean>;
  stopListening: () => Promise<void>;
  restartListening: () => Promise<void>;
  setQuestionText: (text: string) => void;
  clearQuestionText: () => void;
}

export function useQuizVoice(options: UseQuizVoiceOptions): UseQuizVoiceReturn {
  const { enabled, questionType, quizMode, isReading, questionText, onAction, onError } = options;

  const [isListening, setIsListening] = useState(false);

  // Track if we've triggered an interrupt this session to prevent duplicates
  const interruptTriggeredRef = useRef(false);

  // Store latest callbacks in refs to avoid effect dependencies
  const onActionRef = useRef(onAction);
  const onErrorRef = useRef(onError);
  const questionTypeRef = useRef(questionType);
  const quizModeRef = useRef(quizMode);
  const isReadingRef = useRef(isReading);

  // Update refs when props change
  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    questionTypeRef.current = questionType;
  }, [questionType]);

  useEffect(() => {
    quizModeRef.current = quizMode;
  }, [quizMode]);

  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  /**
   * Handle speech result from voice service
   */
  const handleSpeechResult = useCallback((text: string, isFinal: boolean) => {
    const context: AudioActionContext = {
      questionType: questionTypeRef.current,
      quizMode: quizModeRef.current,
      isReading: isReadingRef.current,
      allowCommands: true,
    };

    console.log(`[useQuizVoice] Speech result (final=${isFinal}): "${text}"`);

    const result = classifyAction(text, context);
    if (result.type === 'interrupt') {
      // Only trigger interrupt once per session to avoid duplicates
      if (!interruptTriggeredRef.current) {
        console.log('[useQuizVoice] Interrupt detected!');
        interruptTriggeredRef.current = true;
        onActionRef.current(result);
      } else {
        console.log('[useQuizVoice] Interrupt already triggered this session, ignoring');
      }
      return;
    }

    if (result.type === 'pause' || result.type === 'stop' || result.type === 'quit' || result.type === 'submit') {
      console.log(`[useQuizVoice] Command detected: ${result.type}`);
      onActionRef.current(result);
      return;
    }

    // Pass through answer (speech result) for both partial and final results
    // This allows the UI to update in real-time as the user speaks
    if (result.type === 'answer' && result.text && result.text.trim().length > 0) {
      onActionRef.current(result);
    }
  }, []);

  /**
   * Start voice recognition
   */
  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      // Reset interrupt flag for new session
      interruptTriggeredRef.current = false;

      console.log('[useQuizVoice] Starting listening...');

      const success = await voiceService.startListening(
        {
          continuous: true,
          filterTTSEcho: true,
          preserveCommandWords: true,
          language: 'en-US',
        },
        {
          onResult: (text) => handleSpeechResult(text, true),
          onPartialResult: (text) => handleSpeechResult(text, false),
          onError: (error) => {
            console.error('[useQuizVoice] Voice error:', error);
            onErrorRef.current?.(error);
          },
          onEnd: () => {
            console.log('[useQuizVoice] Voice session ended');
            // Reset interrupt flag when session ends (continuous mode will restart)
            interruptTriggeredRef.current = false;
          },
        }
      );

      if (success) {
        setIsListening(true);
        console.log('[useQuizVoice] Started listening');
      } else {
        console.warn('[useQuizVoice] Failed to start voice service');
      }

      return success;
    } catch (error) {
      console.error('[useQuizVoice] Failed to start:', error);
      return false;
    }
  }, [handleSpeechResult]);

  /**
   * Stop voice recognition
   */
  const stopListening = useCallback(async (): Promise<void> => {
    console.log('[useQuizVoice] Stopping listening...');
    interruptTriggeredRef.current = false;
    setIsListening(false);
    await voiceService.stopListening();
    console.log('[useQuizVoice] Stopped listening');
  }, []);

  /**
   * Restart voice recognition - stops and starts a fresh session
   * Use this after processing a command to clear the voice buffer
   */
  const restartListening = useCallback(async (): Promise<void> => {
    console.log('[useQuizVoice] Restarting listening...');

    // First, fully stop the current session
    setIsListening(false);
    await voiceService.stopListening();

    // Longer delay to ensure native voice service has fully cleaned up
    await new Promise(resolve => setTimeout(resolve, 200));

    // Reset flags
    interruptTriggeredRef.current = false;

    // Start fresh session with new callbacks
    console.log('[useQuizVoice] Starting fresh session after restart...');
    const success = await voiceService.startListening(
      {
        continuous: true,
        filterTTSEcho: true,
        preserveCommandWords: true,
        language: 'en-US',
      },
      {
        onResult: (text) => handleSpeechResult(text, true),
        onPartialResult: (text) => handleSpeechResult(text, false),
        onError: (error) => {
          console.error('[useQuizVoice] Voice error after restart:', error);
          onErrorRef.current?.(error);
        },
        onEnd: () => {
          console.log('[useQuizVoice] Voice session ended after restart');
          interruptTriggeredRef.current = false;
        },
      }
    );

    if (success) {
      setIsListening(true);
      console.log('[useQuizVoice] Restarted listening successfully');
    } else {
      console.warn('[useQuizVoice] Failed to restart listening');
    }
  }, [handleSpeechResult]);

  /**
   * Set question text for TTS echo filtering
   */
  const setQuestionText = useCallback((text: string): void => {
    voiceService.setTTSFilterText(text);
  }, []);

  /**
   * Clear question text filter
   */
  const clearQuestionText = useCallback((): void => {
    voiceService.clearTTSFilter();
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      // Cleanup on unmount
      if (enabled) {
        stopListening();
      }
    };
  }, [enabled, startListening, stopListening]);

  // Update question text filter when it changes
  useEffect(() => {
    if (questionText) {
      setQuestionText(questionText);
    } else {
      clearQuestionText();
    }
  }, [questionText, setQuestionText, clearQuestionText]);

  return {
    isListening,
    startListening,
    stopListening,
    restartListening,
    setQuestionText,
    clearQuestionText,
  };
}
