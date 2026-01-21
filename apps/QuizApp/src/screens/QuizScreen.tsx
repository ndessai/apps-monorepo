/**
 * QuizScreen
 *
 * Main quiz screen with state machine
 * Handles toss-up and bonus questions following NAQT rules
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../providers/ThemeProvider';
import type { QuizStackParamList } from '../types/navigation';
import type {
  QuizState,
  QuizData,
  TossupQuestion,
  BonusQuestion,
  TossupResult,
  BonusResult,
  QuizMode,
} from '../types/quiz';
import type { QuestionTypeKey, AudioActionResult } from '../types/quizFormat';
import {
  BuzzButton,
  TossupReader,
  AnswerBottomSheet,
  AnswerFeedback,
  ScoreDisplay,
  ProgressIndicator,
} from '../components';
import type { TimerState } from '../components';
import type { QuestionTypeKey as QuestionType } from '../types/quizFormat';
import { loadQuestions } from '../services/questionService';
import * as tts from '../services/nativeTtsService';
import { validateAnswer } from '../services/answerValidator';
import {
  calculateTossupPoints,
  calculateBonusPoints,
} from '../services/quizScoring';
import { useSettings } from '../providers/SettingsProvider';
import { useQuizVoice } from '../hooks/useQuizVoice';
import * as audioFeedbackService from '../services/audioFeedbackService';

type Props = NativeStackScreenProps<QuizStackParamList, 'Quiz'>;

const BUZZ_WINDOW_DURATION = 3000; // 3 seconds
const ANSWER_DURATION = 8000; // 8 seconds to answer after buzzing
const BONUS_ANSWER_DURATION = 5000; // 5 seconds per part
const REVIEW_DURATION = 2000; // 2 seconds to show result

export const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const isOnboarding = route.params?.isOnboarding ?? false;
  const quizMode: QuizMode = route.params?.mode ?? 'pro';

  // Quiz data
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentBonusPartIndex, setCurrentBonusPartIndex] = useState(0);

  // State machine
  const [quizState, setQuizState] = useState<QuizState>('idle');

  // Current question tracking
  const [currentQuestion, setCurrentQuestion] = useState<
    TossupQuestion | BonusQuestion | null
  >(null);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [wasBeforePowerMark, setWasBeforePowerMark] = useState(false);

  // Results tracking
  const [tossupResults, setTossupResults] = useState<TossupResult[]>([]);
  const [bonusResults, setBonusResults] = useState<BonusResult[]>([]);
  const [currentScore, setCurrentScore] = useState(0);

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const buzzWindowRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // User settings are now provided by SettingsProvider via useSettings() hook

  // Bottom sheet state
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetTimerState, setBottomSheetTimerState] = useState<TimerState>('idle');
  const [bottomSheetQuestionType, setBottomSheetQuestionType] = useState<QuestionType>('Tossup');

  // Answer feedback state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTimerStarted, setFeedbackTimerStarted] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    points: number;
    userAnswer: string | null;
    acceptableAnswers: string[];
    questionType: QuestionType;
    correctAnswer?: string;
  } | null>(null);

  // Pending action after feedback review completes
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Voice/audio actions state
  const quizStateRef = useRef<QuizState>('idle');
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionTypeKey>('Tossup');
  const [voiceAnswerText, setVoiceAnswerText] = useState<string | undefined>(undefined);
  const voiceAnswerTextRef = useRef<string | undefined>(undefined);
  const restartVoiceRef = useRef<(() => Promise<void>) | null>(null);
  const bottomSheetTimerStateRef = useRef<TimerState>('idle');

  // Pause state for Learn mode
  const [isPaused, setIsPaused] = useState(false);
  const pausedTimeRemainingRef = useRef<number>(0);

  // Ref to track current question for use in interval callbacks (avoids stale closures)
  const currentQuestionRef = useRef<TossupQuestion | BonusQuestion | null>(null);

  // Initialize quiz
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing TTS Wrapper...');
        await tts.initialize();
        console.log('TTS Wrapper initialized, loading questions...');

        // Settings are now provided by SettingsProvider
        const userDifficulty = settings.difficulty;
        console.log('Using settings from provider, difficulty:', userDifficulty);

        const data = await loadQuestions(isOnboarding, userDifficulty);
        console.log('Questions loaded successfully:', data);

        setQuizData(data);
        setQuizState('idle');
      } catch (error) {
        console.error('Failed to initialize quiz:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert(
          'Initialization Error',
          `Failed to initialize quiz: ${errorMessage}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    initialize();

    return () => {
      tts.cleanup();
      clearAllTimers();
      // Stop any ongoing audio feedback
      audioFeedbackService.stopFeedback();
    };
  }, [navigation, settings.difficulty]);

  // Start quiz when data is loaded
  useEffect(() => {
    if (quizData && quizState === 'idle') {
      startNextQuestion();
    }
  }, [quizData, quizState]);

  // Keep quizStateRef in sync with quizState
  useEffect(() => {
    quizStateRef.current = quizState;
  }, [quizState]);

  // Keep currentQuestionRef in sync with currentQuestion
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // Keep voiceAnswerTextRef in sync with voiceAnswerText
  useEffect(() => {
    voiceAnswerTextRef.current = voiceAnswerText;
  }, [voiceAnswerText]);

  // Keep bottomSheetTimerStateRef in sync with bottomSheetTimerState
  useEffect(() => {
    bottomSheetTimerStateRef.current = bottomSheetTimerState;
  }, [bottomSheetTimerState]);

  // Get current question text for TTS echo filtering
  const getQuestionTextForFiltering = useCallback((): string | undefined => {
    if (!currentQuestion) return undefined;
    if ('text' in currentQuestion) {
      return currentQuestion.text;
    } else if ('parts' in currentQuestion) {
      const bonus = currentQuestion as BonusQuestion;
      return bonus.parts[currentBonusPartIndex]?.text;
    }
    return undefined;
  }, [currentQuestion, currentBonusPartIndex]);

  // Handle voice actions from useQuizVoice hook
  const handleVoiceAction = useCallback((action: AudioActionResult) => {
    const currentState = quizStateRef.current;
    const timerState = bottomSheetTimerStateRef.current;

    switch (action.type) {
      case 'interrupt':
        // Buzz/interrupt during tossup reading
        if (currentState === 'reading' || currentState === 'buzz_window') {
          handleBuzz();
          // Restart voice session to clear buffer after processing command
          restartVoiceRef.current?.();
        }
        break;
      case 'pause':
      case 'stop':
        // In Learn mode: pause the entire quiz (TTS + timers)
        if (quizMode === 'learn' && (currentState === 'reading' || currentState === 'buzz_window' || currentState === 'bonus')) {
          handlePause();
          // Restart voice session to clear buffer after processing command
          restartVoiceRef.current?.();
        } else if (currentState === 'bonus') {
          // In Pro mode: stop/pause during bonus reading - stop TTS immediately
          handleBonusVoiceStop();
          // Restart voice session to clear buffer after processing command
          restartVoiceRef.current?.();
        }
        break;
      case 'answer':
        // Speech result that's not a command - update voice text for AnswerInput
        // For tossup: when buzzed or answering
        // For bonus: when timer is counting (after reading finishes)
        if (action.text) {
          const isTossupAnswering = currentState === 'answering' || currentState === 'buzzed';
          const isBonusAnswering = currentState === 'bonus' && timerState === 'counting';
          if (isTossupAnswering || isBonusAnswering) {
            setVoiceAnswerText(action.text);
          }
        }
        break;
      case 'submit':
        // Submit command - trigger answer submission if we have answer text
        {
          const pendingAnswer = voiceAnswerTextRef.current;
          const isTossupAnswering = currentState === 'answering' || currentState === 'buzzed';
          const isBonusAnswering = currentState === 'bonus' && timerState === 'counting';
          if (pendingAnswer && pendingAnswer.trim().length > 0 && (isTossupAnswering || isBonusAnswering)) {
            handleAnswerSubmit(pendingAnswer.trim());
            // Restart voice session after submit
            restartVoiceRef.current?.();
          }
        }
        break;
      case 'quit':
        handleQuit();
        break;
    }
  }, []);

  // Determine if voice should be active based on quiz state
  // Include 'buzzed' and 'answering' states so voice can capture answer text
  const shouldVoiceBeActive = settings.audioActionsEnabled &&
    (quizState === 'reading' || quizState === 'buzz_window' || quizState === 'bonus' ||
     quizState === 'buzzed' || quizState === 'answering');

  // Determine if we're reading (for TTS echo filtering context)
  const isReading = quizState === 'reading' || quizState === 'bonus';

  // Use the quiz voice hook for voice recognition
  const quizVoice = useQuizVoice({
    enabled: shouldVoiceBeActive,
    questionType: currentQuestionType,
    quizMode,
    isReading,
    questionText: getQuestionTextForFiltering(),
    onAction: handleVoiceAction,
    onError: (error) => console.error('[QuizScreen] Voice error:', error),
  });

  // Store restartListening in ref so handleVoiceAction can access it
  useEffect(() => {
    restartVoiceRef.current = quizVoice.restartListening;
  }, [quizVoice.restartListening]);

  // Update question type when question changes
  useEffect(() => {
    if (currentQuestion) {
      if ('powerMarkPosition' in currentQuestion) {
        setCurrentQuestionType('Tossup');
      } else if ('parts' in currentQuestion) {
        setCurrentQuestionType('Bonus');
      }
    }
  }, [currentQuestion]);

  // Clear all timers
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (buzzWindowRef.current) {
      clearTimeout(buzzWindowRef.current);
      buzzWindowRef.current = null;
    }
  };

  // Start next question
  const startNextQuestion = () => {
    if (!quizData) return;

    clearAllTimers();

    // Check if quiz is complete
    if (currentQuestionIndex >= quizData.tossups.length) {
      completeQuiz();
      return;
    }

    // Get next toss-up
    const nextQuestion = quizData.tossups[currentQuestionIndex];
    setCurrentQuestion(nextQuestion);
    setCurrentCharIndex(0);
    setQuizState('reading');

    // Note: Question text for TTS echo filtering is now handled by useQuizVoice hook

    // Progress and finish callbacks for text reveal
    const onProgress = (charIndex: number) => {
      // Only update char index if still reading (not buzzed/answering)
      if (quizStateRef.current === 'reading') {
        setCurrentCharIndex(charIndex);
      }
    };

    const onFinish = () => {
      // Only start buzz window if still in reading state
      if (quizStateRef.current === 'reading') {
        console.log('Reading Finished - starting buzz window');
        startBuzzWindow();
      }
    };

    // Start reading - with TTS if enabled, or silent text reveal if disabled
    if (settings.readQuestions) {
      tts.startReading(
        nextQuestion.text,
        settings.readingSpeedWpm,
        onProgress,
        onFinish
      );
    } else {
      // Silent mode: reveal text at configured WPM without speaking
      tts.startReadingWithoutTTS(
        nextQuestion.text,
        settings.readingSpeedWpm,
        onProgress,
        onFinish
      );
    }
  };

  // Start buzz window (countdown after question finishes)
  const startBuzzWindow = () => {
    setQuizState('buzz_window');
    const buzzerSeconds = Math.ceil(settings.buzzerTimeMs / 1000);
    setTimeRemaining(buzzerSeconds);

    let remaining = buzzerSeconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Clear timer first to prevent multiple calls
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleTimeout();
      }
    }, 1000);
  };

  // Handle voice-stop during bonus question reading
  // Stops TTS immediately, reveals full text, and starts answer timer
  const handleBonusVoiceStop = () => {
    console.log('[QuizScreen] Voice stop during bonus - stopping TTS, revealing full text, starting timer');

    // Stop TTS audio immediately
    tts.stopReading();

    // Reveal full text by setting char index to full length
    if (currentQuestion && 'parts' in currentQuestion) {
      const bonus = currentQuestion as BonusQuestion;
      const part = bonus.parts[currentBonusPartIndex];
      if (part) {
        setCurrentCharIndex(part.text.length);
      }
    }

    // Start the answer timer immediately (don't wait for TTS onFinish)
    // Only if timer is not already counting
    if (bottomSheetTimerState !== 'counting') {
      setBottomSheetTimerState('counting');

      const bonusAnswerSeconds = Math.ceil(settings.bonusAnswerTimeMs / 1000);
      setTimeRemaining(bonusAnswerSeconds);
      let remaining = bonusAnswerSeconds;

      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        remaining -= 1;
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (currentQuestion && 'parts' in currentQuestion) {
            handleBonusTimeout(currentQuestion as BonusQuestion, currentBonusPartIndex);
          }
        }
      }, 1000);
    }
  };

  // Handle pause for Learn mode - pauses TTS and timers
  const handlePause = useCallback(() => {
    if (quizMode !== 'learn') return;
    if (isPaused) return;

    console.log('[QuizScreen] Pausing quiz (Learn mode)');
    setIsPaused(true);

    // Pause TTS
    tts.pauseReading();

    // Store current time remaining and pause timer
    if (timerRef.current) {
      pausedTimeRemainingRef.current = timeRemaining;
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [quizMode, isPaused, timeRemaining]);

  // Handle resume for Learn mode - resumes TTS and timers
  const handleResume = useCallback(() => {
    if (!isPaused) return;

    console.log('[QuizScreen] Resuming quiz (Learn mode)');
    setIsPaused(false);

    // Resume TTS
    tts.resumeReading();

    // Resume timer if there was time remaining
    const remainingTime = pausedTimeRemainingRef.current;
    if (remainingTime > 0) {
      let remaining = remainingTime;
      setTimeRemaining(remaining);

      timerRef.current = setInterval(() => {
        remaining -= 1;
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Handle timeout based on current state
          const currentState = quizStateRef.current;
          if (currentState === 'buzz_window') {
            handleTimeout();
          } else if (currentState === 'answering') {
            handleAnswerTimeout();
          } else if (currentState === 'bonus' && currentQuestion && 'parts' in currentQuestion) {
            handleBonusTimeout(currentQuestion as BonusQuestion, currentBonusPartIndex);
          }
        }
      }, 1000);
    }

    pausedTimeRemainingRef.current = 0;
  }, [isPaused, currentQuestion, currentBonusPartIndex]);

  // Handle buzz button press
  const handleBuzz = async () => {
    // Use ref to get current state (avoids stale closure when called from voice callback)
    const currentState = quizStateRef.current;
    console.log('[QuizScreen] User buzzed in state:', currentState);
    if (currentState !== 'reading' && currentState !== 'buzz_window') return;
    console.log('[QuizScreen] handling User buzzed in');

    // IMMEDIATELY update the ref to stop any pending TTS callbacks
    // This must happen BEFORE stopReading() to prevent race conditions
    quizStateRef.current = 'buzzed';

    clearAllTimers();
    tts.stopReading();

    // Note: Voice recognition is now managed by useQuizVoice hook
    // It will automatically stop when quizState changes away from reading/buzz_window

    // Capture the current char index at buzz time for power mark calculation
    const buzzedAtCharIndex = currentCharIndex;

    // Check if buzzed before power mark
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      const powerPos = currentQuestion.powerMarkPosition;
      setWasBeforePowerMark(buzzedAtCharIndex < powerPos);
    }

    // Keep text at current position - do NOT reveal the rest of the question
    // The text stays where it was when the user buzzed

    setQuizState('buzzed');

    // Show bottom sheet with timer counting for tossup
    // Clear any previous voice answer text
    setVoiceAnswerText(undefined);
    setBottomSheetQuestionType('Tossup');
    setBottomSheetVisible(true);
    setBottomSheetTimerState('counting');

    startAnswerTimer();
  };

  // Start answer timer
  const startAnswerTimer = () => {
    setQuizState('answering');
    const answerSeconds = ANSWER_DURATION / 1000;
    setTimeRemaining(answerSeconds);

    let remaining = answerSeconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Clear timer first to prevent multiple calls
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleAnswerTimeout();
      }
    }, 1000);
  };

  // Handle answer submission
  const handleAnswerSubmit = (answer: string) => {
    clearAllTimers();

    // Stop and reset TTS completely
    tts.stopReading();

    // Hide bottom sheet on submit and clear voice text
    setBottomSheetVisible(false);
    setVoiceAnswerText(undefined);

    if (!currentQuestion) return;

    const isTossup = 'powerMarkPosition' in currentQuestion;

    if (isTossup) {
      handleTossupAnswer(answer, currentQuestion as TossupQuestion);
    } else {
      handleBonusAnswer(answer);
    }
  };

  // Handle answer timeout from bottom sheet
  const handleAnswerTimeUp = () => {
    clearAllTimers();

    // Stop and reset TTS completely
    tts.stopReading();

    // Hide bottom sheet and clear voice text
    setBottomSheetVisible(false);
    setVoiceAnswerText(undefined);

    if (!currentQuestion) return;

    const isTossup = 'powerMarkPosition' in currentQuestion;

    if (isTossup) {
      handleAnswerSubmit(''); // Empty answer = incorrect
    } else {
      // For bonus, move to next part
      const bonus = currentQuestion as BonusQuestion;
      handleBonusTimeout(bonus, currentBonusPartIndex);
    }
  };

  // Handle toss-up answer
  const handleTossupAnswer = async (answer: string, question: TossupQuestion) => {
    const isCorrect = validateAnswer(answer, question.acceptableAnswers);
    const wasInterrupted = quizState === 'answering'; // Interrupted if answered during reading
    const points = calculateTossupPoints(
      isCorrect,
      wasBeforePowerMark,
      wasInterrupted
    );

    // Create result matching TossupResult type
    const result: TossupResult = {
      questionId: question.id,
      category: question.category,
      questionText: question.text,
      buzzedAt: currentCharIndex,
      wasBeforePowerMark,
      userAnswer: answer,
      correctAnswer: question.answer,
      isCorrect,
      wasInterrupted,
      points,
      explanation: question.explanation,
    };

    setTossupResults([...tossupResults, result]);
    setCurrentScore(currentScore + points);

    // Step 1: Show visual feedback immediately
    setFeedbackData({
      isCorrect,
      points,
      userAnswer: answer || null,
      acceptableAnswers: question.acceptableAnswers,
      questionType: 'Tossup',
      correctAnswer: question.answer,
    });
    setFeedbackTimerStarted(false); // Don't start timer yet
    setFeedbackVisible(true);
    setQuizState('review');

    // Step 2: Speak audio feedback if enabled, then start timer
    if (settings.provideAudioFeedback) {
      await audioFeedbackService.speakFeedback({
        isCorrect,
        isTimeUp: false,
        points,
        questionType: 'Tossup',
        tone: settings.audioFeedbackTone,
        userAnswer: answer,
        correctAnswer: question.answer,
      });
    }

    // Step 3: Start the countdown timer after audio completes
    setFeedbackTimerStarted(true);

    // Set pending action for after review completes
    if (isCorrect) {
      pendingActionRef.current = () => showBonusQuestions(question.id);
    } else {
      pendingActionRef.current = () => {
        // Reset char index before moving to next question
        setCurrentCharIndex(0);
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuizState('idle');
      };
    }
  };

  // Show bonus questions
  const showBonusQuestions = (tossupId: string) => {
    if (!quizData) return;

    // Reset char index for new question
    setCurrentCharIndex(0);

    const bonus = quizData.bonuses.find((b) => b.linkedTossupId === tossupId);
    if (!bonus) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuizState('idle');
      return;
    }

    setCurrentBonusPartIndex(0);
    setCurrentQuestion(bonus);
    setQuizState('bonus');
    startBonusPart(bonus, 0);
  };

  // Start bonus part
  const startBonusPart = (bonus: BonusQuestion, partIndex: number) => {
    if (partIndex >= bonus.parts.length) {
      // All parts done, move to next question
      setBottomSheetVisible(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentBonusPartIndex(0);
      setQuizState('idle');
      return;
    }

    const part = bonus.parts[partIndex];
    setCurrentCharIndex(0);

    // CRITICAL: Set state to 'bonus' BEFORE starting TTS
    // This ensures progress callbacks will be processed
    // (coming from 'review' state after previous part's feedback)
    setQuizState('bonus');
    quizStateRef.current = 'bonus';

    // Show bottom sheet for bonus with idle timer (shows "--")
    // Clear any previous voice answer text
    setVoiceAnswerText(undefined);
    setBottomSheetQuestionType('Bonus');
    setBottomSheetVisible(true);
    setBottomSheetTimerState('idle');

    // Note: Bonus part text for TTS echo filtering is now handled by useQuizVoice hook

    const onFinish = () => {
      // Only proceed if still in bonus state
      if (quizStateRef.current !== 'bonus') {
        return;
      }
      console.log('Bonus Reading Finished - starting answer timer');
      // When reading finishes, start countdown timer
      // Note: TTS filter is now managed by useQuizVoice hook
      setBottomSheetTimerState('counting');
      restartVoiceRef.current?.();

      const bonusAnswerSeconds = Math.ceil(settings.bonusAnswerTimeMs / 1000);
      setTimeRemaining(bonusAnswerSeconds);
      let remaining = bonusAnswerSeconds;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          // Clear timer first to prevent multiple calls
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleBonusTimeout(bonus, partIndex);
        }
      }, 1000);
    };

    //for bonus part show entire question:
    setCurrentCharIndex(part.text.length);

    restartVoiceRef.current?.();
    // Start reading - with TTS if enabled, or silent text reveal if disabled
    if (settings.readQuestions) {
      tts.startReading(
        part.text,
        settings.readingSpeedWpm,
        (charIndex: number) => {}, // progress not needed for bonus
        onFinish
      );
    } else {
      // Silent mode: reveal text at configured WPM without speaking
      tts.startReadingWithoutTTS(
        part.text,
        settings.readingSpeedWpm,
        (charIndex: number) => {}, // progress not needed for bonus
        onFinish
      );
    }
  };

  // Handle bonus answer
  const handleBonusAnswer = async (answer: string) => {
    if (!currentQuestion || !('parts' in currentQuestion)) return;

    const bonus = currentQuestion as BonusQuestion;
    const part = bonus.parts[currentBonusPartIndex];

    const isCorrect = validateAnswer(answer, part.acceptableAnswers);
    const partPoints = isCorrect ? (part.pointValue || 10) : 0; // Default to 10 points per part

    // Create part result
    const partResult = {
      partIndex: currentBonusPartIndex,
      questionText: part.text,
      userAnswer: answer,
      correctAnswer: part.answer,
      isCorrect,
      points: partPoints,
    };

    // Store bonus result (accumulate for all parts)
    const existingResultIndex = bonusResults.findIndex(
      (r) => r.questionId === bonus.id
    );

    if (existingResultIndex >= 0) {
      // Add to existing result
      const updatedResults = [...bonusResults];
      updatedResults[existingResultIndex].parts.push(partResult);
      updatedResults[existingResultIndex].totalPoints += partPoints;
      setBonusResults(updatedResults);
    } else {
      // Create new result
      const result: BonusResult = {
        questionId: bonus.id,
        category: bonus.category,
        linkedTossupId: bonus.linkedTossupId,
        parts: [partResult],
        totalPoints: partPoints,
      };
      setBonusResults([...bonusResults, result]);
    }

    setCurrentScore(currentScore + partPoints);

    // Step 1: Show visual feedback immediately
    setFeedbackData({
      isCorrect,
      points: partPoints,
      userAnswer: answer || null,
      acceptableAnswers: part.acceptableAnswers,
      questionType: 'Bonus',
      correctAnswer: part.answer,
    });
    setFeedbackTimerStarted(false); // Don't start timer yet
    setFeedbackVisible(true);
    setQuizState('review');

    // Step 2: Speak audio feedback if enabled
    if (settings.provideAudioFeedback) {
      await audioFeedbackService.speakFeedback({
        isCorrect,
        isTimeUp: false,
        points: partPoints,
        questionType: 'Bonus',
        tone: settings.audioFeedbackTone,
        userAnswer: answer,
        correctAnswer: part.answer,
      });
    }

    // Step 3: Start the countdown timer after audio completes
    setFeedbackTimerStarted(true);

    // Set pending action - move to next part after review
    const nextPartIndex = currentBonusPartIndex + 1;
    pendingActionRef.current = () => {
      setCurrentCharIndex(0);
      setCurrentBonusPartIndex(nextPartIndex);
      startBonusPart(bonus, nextPartIndex);
    };
  };

  // Handle timeout (buzz window)
  const handleTimeout = async () => {
    clearAllTimers();

    // Use ref to get current question (avoids stale closure in interval callback)
    const question = currentQuestionRef.current;

    // No buzz, treat as incorrect with no penalty
    if (question && 'powerMarkPosition' in question) {
      const tossupQuestion = question as TossupQuestion;
      const result: TossupResult = {
        questionId: tossupQuestion.id,
        category: tossupQuestion.category,
        questionText: tossupQuestion.text,
        buzzedAt: null,
        wasBeforePowerMark: false,
        userAnswer: '',
        correctAnswer: tossupQuestion.answer,
        isCorrect: false,
        wasInterrupted: false,
        points: 0,
        explanation: tossupQuestion.explanation,
      };

      setTossupResults((prev) => [...prev, result]);

      // Step 1: Show visual feedback immediately
      setFeedbackData({
        isCorrect: false,
        points: 0,
        userAnswer: null,
        acceptableAnswers: tossupQuestion.acceptableAnswers,
        questionType: 'Tossup',
        correctAnswer: tossupQuestion.answer,
      });
      setFeedbackTimerStarted(false); // Don't start timer yet
      setFeedbackVisible(true);
      setQuizState('review');

      // Step 2: Speak audio feedback for time up if enabled
      if (settings.provideAudioFeedback) {
        await audioFeedbackService.speakFeedback({
          isCorrect: false,
          isTimeUp: true,
          points: 0,
          questionType: 'Tossup',
          tone: settings.audioFeedbackTone,
          userAnswer: null,
          correctAnswer: tossupQuestion.answer,
        });
      }

      // Step 3: Start the countdown timer after audio completes
      setFeedbackTimerStarted(true);

      // Set pending action using functional update to avoid stale closure
      pendingActionRef.current = () => {
        // Reset char index before moving to next question
        setCurrentCharIndex(0);
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuizState('idle');
      };
    }
  };

  // Handle answer timeout
  const handleAnswerTimeout = () => {
    clearAllTimers();
    handleAnswerSubmit(''); // Empty answer = incorrect
  };

  // Handle bonus timeout
  const handleBonusTimeout = async (bonus: BonusQuestion, partIndex: number) => {
    clearAllTimers();

    // Stop and reset TTS completely
    tts.stopReading();

    setBottomSheetVisible(false);

    const part = bonus.parts[partIndex];

    // Create part result for timeout (incorrect, 0 points)
    const partResult = {
      partIndex,
      questionText: part.text,
      userAnswer: '',
      correctAnswer: part.answer,
      isCorrect: false,
      points: 0,
    };

    // Store bonus result (accumulate for all parts)
    const existingResultIndex = bonusResults.findIndex(
      (r) => r.questionId === bonus.id
    );

    if (existingResultIndex >= 0) {
      // Add to existing result
      const updatedResults = [...bonusResults];
      updatedResults[existingResultIndex].parts.push(partResult);
      setBonusResults(updatedResults);
    } else {
      // Create new result
      const result: BonusResult = {
        questionId: bonus.id,
        category: bonus.category,
        linkedTossupId: bonus.linkedTossupId,
        parts: [partResult],
        totalPoints: 0,
      };
      setBonusResults([...bonusResults, result]);
    }

    // Step 1: Show visual feedback immediately
    setFeedbackData({
      isCorrect: false,
      points: 0,
      userAnswer: null,
      acceptableAnswers: part.acceptableAnswers,
      questionType: 'Bonus',
      correctAnswer: part.answer,
    });
    setFeedbackTimerStarted(false); // Don't start timer yet
    setFeedbackVisible(true);
    setQuizState('review');

    // Step 2: Speak audio feedback for time up if enabled
    if (settings.provideAudioFeedback) {
      await audioFeedbackService.speakFeedback({
        isCorrect: false,
        isTimeUp: true,
        points: 0,
        questionType: 'Bonus',
        tone: settings.audioFeedbackTone,
        userAnswer: null,
        correctAnswer: part.answer,
      });
    }

    // Step 3: Start the countdown timer after audio completes
    setFeedbackTimerStarted(true);

    // Set pending action - move to next part after review
    const nextPartIndex = partIndex + 1;
    pendingActionRef.current = () => {
      // Reset char index for next part
      setCurrentCharIndex(0);
      setCurrentBonusPartIndex(nextPartIndex);
      startBonusPart(bonus, nextPartIndex);
    };
  };

  // Handle feedback review complete
  const handleReviewComplete = () => {
    setFeedbackVisible(false);
    setFeedbackData(null);
    setFeedbackTimerStarted(false); // Reset for next feedback

    // Execute pending action if any
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  };

  // Handle quit button press
  const handleQuit = () => {
    Alert.alert(
      'Quit Quiz',
      'Are you sure you want to quit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            // Stop all ongoing activities
            clearAllTimers();
            tts.stopReading();
            setBottomSheetVisible(false);

            // Note: Voice recognition is now managed by useQuizVoice hook
            // It will automatically stop when component unmounts

            // Stop any ongoing audio feedback
            audioFeedbackService.stopFeedback();

            // Navigate to results with current progress
            const session = {
              tossupResults,
              bonusResults,
              totalScore: currentScore,
              maxScore: calculateMaxScore(),
              completedAt: new Date().toISOString(),
            };

            navigation.replace('QuizResults', { session, isOnboarding });
          },
        },
      ]
    );
  };

  // Complete quiz
  const completeQuiz = () => {
    setQuizState('completed');

    const session = {
      tossupResults,
      bonusResults,
      totalScore: currentScore,
      maxScore: calculateMaxScore(),
      completedAt: new Date().toISOString(),
    };

    navigation.replace('QuizResults', { session, isOnboarding });
  };

  // Calculate max possible score
  const calculateMaxScore = (): number => {
    if (!quizData) return 0;

    // Max tossup: 15 points each
    // Max bonus: 30 points each (3 parts × 10)
    const maxTossup = quizData.tossups.length * 15;
    const maxBonus = quizData.bonuses.length * 30;
    return maxTossup + maxBonus;
  };

  // Get current question for display
  const getCurrentQuestionText = (): string => {
    if (!currentQuestion) return '';

    if ('powerMarkPosition' in currentQuestion) {
      return currentQuestion.text;
    } else {
      const bonus = currentQuestion as BonusQuestion;
      return bonus.parts[currentBonusPartIndex]?.text || '';
    }
  };

  // Get power mark position
  const getPowerMarkPosition = (): number | undefined => {
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      return (currentQuestion as TossupQuestion).powerMarkPosition;
    }
    return undefined;
  };

  // Get total questions (tossups only - bonuses are linked to tossups)
  const getTotalQuestions = (): number => {
    if (!quizData) return 0;
    return quizData.tossups.length;
  };

  // Get question type
  const getQuestionType = (): 'Tossup' | 'Bonus' => {
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      return 'Tossup';
    }
    return 'Bonus';
  };

  if (!quizData || !currentQuestion) {
    return <View style={[styles.container, { backgroundColor: colors.background.default }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface.default, borderBottomColor: colors.divider }]}>
        <View style={styles.headerLeft}>
          <ProgressIndicator
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={getTotalQuestions()}
            questionType={getQuestionType()}
            bonusPartIndex={currentBonusPartIndex}
            totalBonusParts={
              currentQuestion && 'parts' in currentQuestion
                ? (currentQuestion as BonusQuestion).parts.length
                : undefined
            }
          />
          {quizMode === 'learn' && (
            <View style={[styles.modeBadge, { backgroundColor: colors.primary.light }]}>
              <Text style={[styles.modeBadgeText, { color: colors.primary.onPrimary }]}>LEARN</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <ScoreDisplay currentScore={currentScore} maxScore={calculateMaxScore()} />
          {!isOnboarding && (
            <TouchableOpacity
              style={styles.quitButton}
              onPress={handleQuit}
              testID="quiz-quit-button"
            >
              <Icon name="close" size={24} color={colors.error.main} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Question Display */}
      <View style={styles.questionContainer}>
        <TossupReader
          text={getCurrentQuestionText()}
          currentCharIndex={currentCharIndex}
          powerMarkPosition={getPowerMarkPosition()}
          questionType={getQuestionType()}
          bonusPartIndex={currentBonusPartIndex}
          showMicrophoneIndicator={settings.audioActionsEnabled}
          isVoiceListening={quizVoice.isListening}
        />
      </View>

      {/* Buzz Button - only show during reading or buzz_window, hide when feedback is shown */}
      {(quizState === 'reading' || quizState === 'buzz_window') &&
       !feedbackVisible &&
       !feedbackData && (
        <View style={styles.buzzContainer}>
          <BuzzButton
            onPress={handleBuzz}
            disabled={false}
            isInBuzzWindow={quizState === 'buzz_window'}
            countdownSeconds={quizState === 'buzz_window' ? timeRemaining : undefined}
          />
        </View>
      )}

      {/* Answer Bottom Sheet */}
      <AnswerBottomSheet
        key={`answer-sheet-${currentQuestionIndex}-${currentBonusPartIndex}`}
        visible={bottomSheetVisible}
        onSubmit={handleAnswerSubmit}
        onTimeUp={handleAnswerTimeUp}
        questionType={bottomSheetQuestionType}
        timerState={bottomSheetTimerState}
        answerTimeMs={
          bottomSheetQuestionType === 'Tossup'
            ? settings.tossupAnswerTimeMs
            : settings.bonusAnswerTimeMs
        }
        voiceText={voiceAnswerText}
        isVoiceListening={quizVoice.isListening}
        isVoiceAvailable={settings.audioActionsEnabled}
        autoSubmitOnSilence={settings.autoSubmitOnSilence}
        autoSubmitSilenceMs={settings.autoSubmitSilenceMs}
        testID="quiz-answer-bottom-sheet"
      />

      {/* Answer Feedback */}
      {feedbackData && (
        <AnswerFeedback
          key={`feedback-${currentQuestionIndex}-${currentBonusPartIndex}`}
          visible={feedbackVisible}
          isCorrect={feedbackData.isCorrect}
          points={feedbackData.points}
          userAnswer={feedbackData.userAnswer}
          acceptableAnswers={feedbackData.acceptableAnswers}
          questionType={feedbackData.questionType}
          reviewTimeMs={
            feedbackData.questionType === 'Tossup'
              ? settings.tossupReviewTimeMs
              : settings.bonusReviewTimeMs
          }
          onReviewComplete={handleReviewComplete}
          delayTimer={settings.provideAudioFeedback}
          startTimer={feedbackTimerStarted}
          testID="quiz-answer-feedback"
        />
      )}

      {/* Pause Overlay for Learn Mode */}
      {isPaused && (
        <View style={[styles.pauseOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[styles.pauseContent, { backgroundColor: colors.surface.default }]}>
            <Icon name="pause-circle" size={64} color={colors.primary.main} />
            <Text variant="headlineMedium" style={[styles.pauseTitle, { color: colors.text.primary }]}>
              PAUSED
            </Text>
            <Text variant="bodyMedium" style={[styles.pauseSubtitle, { color: colors.text.secondary }]}>
              Take your time to review the question
            </Text>
            <Button
              mode="contained"
              onPress={handleResume}
              style={styles.resumeButton}
              testID="resume-button"
            >
              Resume
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  quitButton: {
    padding: 8,
    marginLeft: 4,
  },
  questionContainer: {
    flex: 1,
  },
  buzzContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  pauseTitle: {
    marginTop: 16,
    fontWeight: '700',
  },
  pauseSubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  resumeButton: {
    marginTop: 24,
    minWidth: 140,
  },
});
