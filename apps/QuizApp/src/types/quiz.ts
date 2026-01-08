/**
 * Quiz Type Definitions
 *
 * Types for NAQT-format quiz bowl questions, answers, and scoring
 */

// Question categories
export type QuestionCategory =
  | 'Science'
  | 'Literature'
  | 'History'
  | 'Fine Arts'
  | 'Geography'
  | 'Social Science'
  | 'Current Events'
  | 'Mathematics'
  | 'Mythology'
  | 'Philosophy';

// Question difficulty levels
export type QuestionDifficulty =
  | 'middle_school'
  | 'high_school'
  | 'college'
  | 'open';

// Toss-up question structure
export interface TossupQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  text: string;
  powerMarkPosition: number; // character index for power mark (★)
  answer: string;
  acceptableAnswers: string[];
  explanation?: string;
}

// Bonus question part
export interface BonusPart {
  text: string;
  answer: string;
  acceptableAnswers: string[];
}

// Bonus question structure (always 3 parts)
export interface BonusQuestion {
  id: string;
  linkedTossupId: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  parts: [BonusPart, BonusPart, BonusPart]; // Exactly 3 parts
}

// Complete quiz data
export interface QuizData {
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

// Quiz state machine states
export type QuizState =
  | 'idle'           // Not started
  | 'reading'        // TTS reading toss-up
  | 'buzz_window'    // 3s window after question ends
  | 'buzzed'         // User buzzed, TTS stopped
  | 'answering'      // 3s countdown for answer
  | 'bonus'          // Answering bonus questions
  | 'review'         // Showing correct answer after incorrect
  | 'completed';     // Quiz finished

// Toss-up question result
export interface TossupResult {
  questionId: string;
  category: QuestionCategory;
  questionText: string;
  buzzedAt: number | null; // character position, null if no buzz
  wasBeforePowerMark: boolean;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  wasInterrupted: boolean; // buzzed before question finished
  points: number; // 15, 10, -5, or 0
  explanation?: string;
}

// Bonus question result
export interface BonusResult {
  questionId: string;
  category: QuestionCategory;
  linkedTossupId: string;
  parts: {
    partIndex: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number; // 10 or 0
  }[];
  totalPoints: number; // 0-30
}

// Complete quiz session
export interface QuizSession {
  startTime: Date;
  endTime?: Date;
  tossupResults: TossupResult[];
  bonusResults: BonusResult[];
  totalScore: number;
  maxPossibleScore: number;
  accuracy: number; // percentage (0-100)
}

// Quiz screen state (internal)
export interface QuizScreenState {
  quizData: QuizData | null;
  currentQuestionIndex: number; // Overall progress (0-7 for MVP)
  currentTossupIndex: number; // Which toss-up (0-1)
  currentBonusPartIndex: number; // Which bonus part (0-2)
  quizState: QuizState;
  currentCharIndex: number; // For word highlighting
  currentScore: number;
  session: QuizSession;
  countdown: number; // For answer/bonus timers
  userAnswer: string;
  showAnswerInput: boolean;
  isProcessingAnswer: boolean;
}
