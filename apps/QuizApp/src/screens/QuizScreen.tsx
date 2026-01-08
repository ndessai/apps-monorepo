/**
 * QuizScreen
 *
 * Main quiz screen with state machine
 * Handles toss-up and bonus questions following NAQT rules
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '@monorepo/ui-components';
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
import {
  BuzzButton,
  TossupReader,
  AnswerInput,
  ScoreDisplay,
  ProgressIndicator,
} from '../components';
import { loadQuestions } from '../services/questionService';
import * as ttsService from '../services/ttsService';
import { validateAnswer } from '../services/answerValidator';
import {
  calculateTossupPoints,
  calculateBonusPoints,
} from '../services/quizScoring';

type Props = NativeStackScreenProps<QuizStackParamList, 'Quiz'>;

const BUZZ_WINDOW_DURATION = 3000; // 3 seconds
const ANSWER_DURATION = 8000; // 8 seconds to answer after buzzing
const BONUS_ANSWER_DURATION = 5000; // 5 seconds per part
const REVIEW_DURATION = 2000; // 2 seconds to show result

export const QuizScreen: React.FC<Props> = ({ navigation }) => {
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const buzzWindowRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize quiz
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing TTS...');
        await ttsService.initializeTTS();
        console.log('TTS initialized, loading questions...');

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
    };
  }, [navigation]);

  // Start quiz when data is loaded
  useEffect(() => {
    if (quizData && quizState === 'idle') {
      startNextQuestion();
    }
  }, [quizData, quizState]);

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

    // Start TTS with progress and finish callbacks
    ttsService.speakText(
      nextQuestion.text,
      (charIndex) => {
        setCurrentCharIndex(charIndex);
      },
      () => {
        // When TTS finishes, start buzz window
        startBuzzWindow();
      }
    );
  };

  // Start buzz window (3s after question finishes)
  const startBuzzWindow = () => {
    setQuizState('buzz_window');
    setTimeRemaining(3);

    let remaining = 3;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        handleTimeout();
      }
    }, 1000);
  };

  // Handle buzz button press
  const handleBuzz = () => {
    if (quizState !== 'reading' && quizState !== 'buzz_window') return;

    clearAllTimers();
    ttsService.stopSpeaking();

    // Check if buzzed before power mark
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      const powerPos = currentQuestion.powerMarkPosition;
      setWasBeforePowerMark(currentCharIndex < powerPos);
    }

    // Keep text revealed only up to the current position
    // currentCharIndex remains at its current value (where user buzzed)

    setQuizState('buzzed');
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
        handleAnswerTimeout();
      }
    }, 1000);
  };

  // Handle answer submission
  const handleAnswerSubmit = (answer: string) => {
    clearAllTimers();

    if (!currentQuestion) return;

    const isTossup = 'powerMarkPosition' in currentQuestion;

    if (isTossup) {
      handleTossupAnswer(answer, currentQuestion as TossupQuestion);
    } else {
      handleBonusAnswer(answer);
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

    // If correct, show bonus questions
    if (isCorrect) {
      showBonusQuestions(question.id);
    } else {
      // Move to next question
      setQuizState('review');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuizState('idle');
      }, REVIEW_DURATION);
    }
  };

  // Show bonus questions
  const showBonusQuestions = (tossupId: string) => {
    if (!quizData) return;

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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentBonusPartIndex(0);
      setQuizState('idle');
      return;
    }

    const part = bonus.parts[partIndex];
    setCurrentCharIndex(0);

    // Read the part with progress and finish callbacks
    ttsService.speakText(
      part.text,
      (charIndex) => {
        setCurrentCharIndex(charIndex);
      },
      () => {
        // When TTS finishes, start answer timer
        setTimeRemaining(5);
        let remaining = 5;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setTimeRemaining(remaining);

          if (remaining <= 0) {
            handleBonusTimeout(bonus, partIndex);
          }
        }, 1000);
      }
    );
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

    // Move to next part
    setCurrentBonusPartIndex(currentBonusPartIndex + 1);
    startBonusPart(bonus, currentBonusPartIndex + 1);
  };

  // Handle timeout (buzz window)
  const handleTimeout = () => {
    clearAllTimers();

    // No buzz, treat as incorrect with no penalty
    if (currentQuestion && 'powerMarkPosition' in currentQuestion) {
      const result: TossupResult = {
        question: currentQuestion as TossupQuestion,
        userAnswer: null,
        isCorrect: false,
        wasBeforePowerMark: false,
        wasInterrupted: false,
        points: 0,
      };

      setTossupResults([...tossupResults, result]);
    }

    // Move to next question
    setQuizState('review');
    setTimeout(() => {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuizState('idle');
    }, REVIEW_DURATION);
  };

  // Handle answer timeout
  const handleAnswerTimeout = () => {
    clearAllTimers();
    handleAnswerSubmit(''); // Empty answer = incorrect
  };

  // Handle bonus timeout
  const handleBonusTimeout = (bonus: BonusQuestion, partIndex: number) => {
    clearAllTimers();

    // Treat as incorrect (0 points)
    const result: BonusResult = {
      question: bonus,
      userAnswer: null,
      isCorrect: false,
      points: 0,
    };

    setBonusResults([...bonusResults, result]);

    // Move to next part
    setCurrentBonusPartIndex(partIndex + 1);
    startBonusPart(bonus, partIndex + 1);
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
        <ScoreDisplay currentScore={currentScore} maxScore={calculateMaxScore()} />
      </View>

      {/* Question Display */}
      <View style={styles.questionContainer}>
        <TossupReader
          text={getCurrentQuestionText()}
          currentCharIndex={currentCharIndex}
          powerMarkPosition={getPowerMarkPosition()}
        />
      </View>

      {/* Buzz Button */}
      {(quizState === 'reading' || quizState === 'buzz_window') && (
        <View style={styles.buzzContainer}>
          <BuzzButton onPress={handleBuzz} disabled={false} />
        </View>
      )}

      {/* Answer Input */}
      {(quizState === 'answering' || quizState === 'bonus') && (
        <AnswerInput
          onSubmit={handleAnswerSubmit}
          timeRemaining={timeRemaining}
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
