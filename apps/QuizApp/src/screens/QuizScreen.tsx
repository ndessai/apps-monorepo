/**
 * QuizScreen
 *
 * Main quiz screen with state machine
 * Handles toss-up and bonus questions following NAQT rules
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@monorepo/ui-components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { QuizStackParamList } from '../types/navigation';
import type {
  QuizState,
  QuizData,
  TossupQuestion,
  BonusQuestion,
  TossupResult,
  BonusResult,
  QuizSession,
} from '../types/quiz';
import type { QuizSettingsData } from '../types/settings';
import { DEFAULT_QUIZ_SETTINGS } from '../types/settings';
import {
  BuzzButton,
  TossupReader,
  AnswerBottomSheet,
  AnswerFeedback,
  ScoreDisplay,
  ProgressIndicator,
} from '../components';
import type { TimerState, QuestionType } from '../components';
import { loadQuestions } from '../services/questionService';
import * as ttsService from '../services/ttsService';
import { validateAnswer } from '../services/answerValidator';
import {
  calculateTossupPoints,
  calculateBonusPoints,
} from '../services/quizScoring';
import { useDatabase } from '../providers/DatabaseProvider';
import { getCurrentUser } from '../services/userService';
import { getQuizSettings } from '../services/quizSettingsService';
import * as audioActionsService from '../services/audioActionsService';

type Props = NativeStackScreenProps<QuizStackParamList, 'Quiz'>;

const BUZZ_WINDOW_DURATION = 3000; // 3 seconds
const ANSWER_DURATION = 8000; // 8 seconds to answer after buzzing
const BONUS_ANSWER_DURATION = 5000; // 5 seconds per part
const REVIEW_DURATION = 2000; // 2 seconds to show result

export const QuizScreen: React.FC<Props> = ({ navigation }) => {
  const database = useDatabase();

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

  // User settings
  const [settings, setSettings] = useState<QuizSettingsData>(DEFAULT_QUIZ_SETTINGS);

  // Bottom sheet state
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetTimerState, setBottomSheetTimerState] = useState<TimerState>('idle');
  const [bottomSheetQuestionType, setBottomSheetQuestionType] = useState<QuestionType>('tossup');

  // Answer feedback state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    points: number;
    userAnswer: string | null;
    acceptableAnswers: string[];
    questionType: QuestionType;
  } | null>(null);

  // Pending action after feedback review completes
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Audio actions state
  const audioActionsActiveRef = useRef(false);
  const pendingVoiceAnswerRef = useRef<string | null>(null);
  const quizStateRef = useRef<QuizState>('idle');

  // Ref to track current question for use in interval callbacks (avoids stale closures)
  const currentQuestionRef = useRef<TossupQuestion | BonusQuestion | null>(null);

  // Initialize quiz
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing TTS...');
        await ttsService.initializeTTS();
        console.log('TTS initialized, loading questions...');

        // Load user settings
        const user = await getCurrentUser(database);
        if (user) {
          const userSettings = await getQuizSettings(database, user.userId);
          setSettings(userSettings);
          // Set TTS reading speed from user settings
          ttsService.setReadingSpeed(userSettings.readingSpeedWpm);
          console.log('User settings loaded:', userSettings);
        }

        const data = await loadQuestions();
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
      ttsService.stopSpeaking();
      ttsService.cleanupTTS();
      clearAllTimers();
      // Stop audio actions on cleanup
      if (audioActionsActiveRef.current) {
        audioActionsService.stopAudioActions();
        audioActionsActiveRef.current = false;
      }
    };
  }, [navigation, database]);

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

  // Manage audio actions based on settings and quiz state
  useEffect(() => {
    const manageAudioActions = async () => {
      // Only activate if audioActionsEnabled setting is on
      if (!settings.audioActionsEnabled) {
        if (audioActionsActiveRef.current) {
          await audioActionsService.stopAudioActions();
          audioActionsActiveRef.current = false;
        }
        return;
      }

      // Start audio actions during reading or buzz_window for tossups
      const shouldBeActive = quizState === 'reading' || quizState === 'buzz_window';

      if (shouldBeActive && !audioActionsActiveRef.current) {
        // Start listening for "Buzz" command
        const started = await audioActionsService.startAudioActions({
          onBuzzDetected: () => {
            console.log('[QuizScreen] Voice buzz detected!');
            // Trigger buzz if in valid state - use ref to get current state
            const currentState = quizStateRef.current;
            if (currentState === 'reading' || currentState === 'buzz_window') {
              handleBuzz();
            }
          },
          onSpeechResult: (text: string) => {
            console.log('[QuizScreen] Voice speech result:', text);
            // Store the speech result for when bottom sheet is shown
            // This handles the case where user speaks answer right after buzzing
            const currentState = quizStateRef.current;
            if (currentState === 'answering' || currentState === 'buzzed') {
              pendingVoiceAnswerRef.current = text;
            }
          },
          onError: (error: string) => {
            console.error('[QuizScreen] Audio actions error:', error);
          },
        });

        if (started) {
          audioActionsActiveRef.current = true;

          // Set question text for filtering if we have a current question
          if (currentQuestion && 'text' in currentQuestion) {
            audioActionsService.setQuestionTextForFiltering(currentQuestion.text);
          }
        }
      } else if (!shouldBeActive && audioActionsActiveRef.current) {
        // Stop audio actions when not in reading/buzz_window state
        // But keep it active during answering for voice answer input
        if (quizState !== 'answering' && quizState !== 'buzzed') {
          await audioActionsService.stopAudioActions();
          audioActionsActiveRef.current = false;
        } else {
          // Clear the question text filter when buzzing in
          audioActionsService.clearQuestionTextFilter();
        }
      }
    };

    manageAudioActions();
  }, [settings.audioActionsEnabled, quizState, currentQuestion]);

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

    // Set question text for filtering in audio actions mode
    // This prevents the TTS audio from being picked up as user speech
    if (settings.audioActionsEnabled) {
      audioActionsService.setQuestionTextForFiltering(nextQuestion.text);
    }

    // Start TTS with progress and finish callbacks
    ttsService.speakText(
      nextQuestion.text,
      (charIndex) => {
        // Only update char index if still reading (not buzzed/answering)
        if (quizStateRef.current === 'reading') {
          setCurrentCharIndex(charIndex);
        }
      },
      () => {
        // Only start buzz window if still in reading state
        if (quizStateRef.current === 'reading') {
          console.log('TTS Finished - starting buzz window');
          startBuzzWindow();
        }
      }
    ).catch((error) => {
      console.error('TTS speakText failed:', error);
      Alert.alert('Error', 'Failed to read question. Please try again.');
    });
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

  // Handle buzz button press
  const handleBuzz = () => {
    if (quizState !== 'reading' && quizState !== 'buzz_window') return;

    // IMMEDIATELY update the ref to stop any pending TTS callbacks
    // This must happen BEFORE stopSpeaking() to prevent race conditions
    quizStateRef.current = 'buzzed';

    clearAllTimers();
    ttsService.stopSpeaking();

    // Clear question text filter when buzzing (user is now answering, not listening to question)
    if (settings.audioActionsEnabled) {
      audioActionsService.clearQuestionTextFilter();
    }

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
    setBottomSheetQuestionType('tossup');
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

    // Hide bottom sheet on submit
    setBottomSheetVisible(false);

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
    setBottomSheetVisible(false);

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
  const handleTossupAnswer = (answer: string, question: TossupQuestion) => {
    const isCorrect = validateAnswer(answer, question.acceptableAnswers);
    const wasInterrupted = quizState === 'answering'; // Interrupted if answered during reading
    const points = calculateTossupPoints(
      isCorrect,
      wasBeforePowerMark,
      wasInterrupted
    );

    // Create result
    const result: TossupResult = {
      question,
      userAnswer: answer,
      isCorrect,
      wasBeforePowerMark,
      wasInterrupted,
      points,
    };

    setTossupResults([...tossupResults, result]);
    setCurrentScore(currentScore + points);

    // Show feedback
    setFeedbackData({
      isCorrect,
      points,
      userAnswer: answer || null,
      acceptableAnswers: question.acceptableAnswers,
      questionType: 'tossup',
    });
    setFeedbackVisible(true);
    setQuizState('review');

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

    // Show bottom sheet for bonus with idle timer (shows "--")
    setBottomSheetQuestionType('bonus');
    setBottomSheetVisible(true);
    setBottomSheetTimerState('idle');

    // Set bonus part text for filtering in audio actions mode
    if (settings.audioActionsEnabled) {
      audioActionsService.setQuestionTextForFiltering(part.text);
    }

    // Read the part with progress and finish callbacks
    ttsService.speakText(
      part.text,
      (charIndex) => {
        // Only update char index if still in bonus state (not answering)
        if (quizStateRef.current === 'bonus') {
          setCurrentCharIndex(charIndex);
        }
      },
      () => {
        // Only proceed if still in bonus state
        if (quizStateRef.current !== 'bonus') {
          return;
        }
        console.log('Bonus TTS Finished - starting answer timer');
        // When TTS finishes, start countdown timer and clear filter
        setBottomSheetTimerState('counting');

        // Clear filter when TTS finishes - user can now speak answer
        if (settings.audioActionsEnabled) {
          audioActionsService.clearQuestionTextFilter();
        }

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
      }
    ).catch((error) => {
      console.error('Bonus TTS speakText failed:', error);
      Alert.alert('Error', 'Failed to read bonus question. Please try again.');
    });
  };

  // Handle bonus answer
  const handleBonusAnswer = (answer: string) => {
    if (!currentQuestion || !('parts' in currentQuestion)) return;

    const bonus = currentQuestion as BonusQuestion;
    const part = bonus.parts[currentBonusPartIndex];

    const isCorrect = validateAnswer(answer, part.acceptableAnswers);
    const points = isCorrect ? (part.pointValue || 10) : 0; // Default to 10 points per part

    // Store bonus result (accumulate for all parts)
    const existingResult = bonusResults.find(
      (r) => r.question.id === bonus.id
    );

    if (existingResult) {
      existingResult.points += points;
      existingResult.userAnswer = answer;
      setBonusResults([...bonusResults]);
    } else {
      const result: BonusResult = {
        question: bonus,
        userAnswer: answer,
        isCorrect,
        points,
      };
      setBonusResults([...bonusResults, result]);
    }

    setCurrentScore(currentScore + points);

    // Show feedback
    setFeedbackData({
      isCorrect,
      points,
      userAnswer: answer || null,
      acceptableAnswers: part.acceptableAnswers,
      questionType: 'bonus',
    });
    setFeedbackVisible(true);
    setQuizState('review');

    // Set pending action - move to next part after review
    const nextPartIndex = currentBonusPartIndex + 1;
    pendingActionRef.current = () => {
      setCurrentCharIndex(0);
      setCurrentBonusPartIndex(nextPartIndex);
      startBonusPart(bonus, nextPartIndex);
    };
  };

  // Handle timeout (buzz window)
  const handleTimeout = () => {
    clearAllTimers();

    // Use ref to get current question (avoids stale closure in interval callback)
    const question = currentQuestionRef.current;

    // No buzz, treat as incorrect with no penalty
    if (question && 'powerMarkPosition' in question) {
      const tossupQuestion = question as TossupQuestion;
      const result: TossupResult = {
        question: tossupQuestion,
        userAnswer: null,
        isCorrect: false,
        wasBeforePowerMark: false,
        wasInterrupted: false,
        points: 0,
      };

      setTossupResults((prev) => [...prev, result]);

      // Show feedback for timeout - set feedback data first, then show it
      const feedbackInfo = {
        isCorrect: false,
        points: 0,
        userAnswer: null,
        acceptableAnswers: tossupQuestion.acceptableAnswers,
        questionType: 'tossup' as const,
      };
      setFeedbackData(feedbackInfo);
      setFeedbackVisible(true);
      setQuizState('review');

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
  const handleBonusTimeout = (bonus: BonusQuestion, partIndex: number) => {
    clearAllTimers();
    setBottomSheetVisible(false);

    const part = bonus.parts[partIndex];

    // Treat as incorrect (0 points)
    const result: BonusResult = {
      question: bonus,
      userAnswer: null,
      isCorrect: false,
      points: 0,
    };

    setBonusResults([...bonusResults, result]);

    // Show feedback for timeout
    setFeedbackData({
      isCorrect: false,
      points: 0,
      userAnswer: null,
      acceptableAnswers: part.acceptableAnswers,
      questionType: 'bonus',
    });
    setFeedbackVisible(true);
    setQuizState('review');

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
            ttsService.stopSpeaking();
            setBottomSheetVisible(false);

            // Stop audio actions
            if (audioActionsActiveRef.current) {
              audioActionsService.stopAudioActions();
              audioActionsActiveRef.current = false;
            }

            // Navigate to results with current progress
            const session = {
              tossupResults,
              bonusResults,
              totalScore: currentScore,
              maxScore: calculateMaxScore(),
              completedAt: new Date().toISOString(),
            };

            navigation.replace('QuizResults', { session });
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

    navigation.replace('QuizResults', { session });
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

  // Get total questions
  const getTotalQuestions = (): number => {
    if (!quizData) return 0;
    return quizData.tossups.length + quizData.bonuses.length;
  };

  // Get question type
  const getQuestionType = (): 'tossup' | 'bonus' => {
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      return 'tossup';
    }
    return 'bonus';
  };

  if (!quizData || !currentQuestion) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ProgressIndicator
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={getTotalQuestions()}
          questionType={getQuestionType()}
        />
        <View style={styles.headerRight}>
          <ScoreDisplay currentScore={currentScore} maxScore={calculateMaxScore()} />
          <TouchableOpacity
            style={styles.quitButton}
            onPress={handleQuit}
            testID="quiz-quit-button"
          >
            <Icon name="close" size={24} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Display */}
      <View style={styles.questionContainer}>
        <TossupReader
          text={getCurrentQuestionText()}
          currentCharIndex={currentCharIndex}
          powerMarkPosition={getPowerMarkPosition()}
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
          bottomSheetQuestionType === 'tossup'
            ? settings.tossupAnswerTimeMs
            : settings.bonusAnswerTimeMs
        }
        microphoneEnabledByDefault={settings.microphoneEnabled}
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
            feedbackData.questionType === 'tossup'
              ? settings.tossupReviewTimeMs
              : settings.bonusReviewTimeMs
          }
          onReviewComplete={handleReviewComplete}
          testID="quiz-answer-feedback"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
});
