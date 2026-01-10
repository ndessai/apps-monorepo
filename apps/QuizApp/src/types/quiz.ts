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
  | 'Philosophy'
  | 'Human Body';

// Question source tracking
export type QuestionSource = 'qbreader' | 'ai-generated' | 'manual';

// Subcategory mappings for granular scoring
export type SubcategoryMap = {
  Science: 'Biology' | 'Chemistry' | 'Physics' | 'Earth Science' | 'Computer Science' | 'Astronomy' | 'Other Science';
  'Human Body': 'Cardiovascular' | 'Respiratory' | 'Digestive' | 'Nervous' | 'Musculoskeletal' | 'Immune' | 'Endocrine' | 'Integumentary' | 'Urinary' | 'General Anatomy';
  Literature: 'American Literature' | 'British Literature' | 'European Literature' | 'World Literature' | 'Classical Literature' | 'Poetry' | 'Drama';
  History: 'American History' | 'European History' | 'World History' | 'Ancient History' | 'Military History';
  'Fine Arts': 'Painting' | 'Sculpture' | 'Music Classical' | 'Music Other' | 'Architecture' | 'Opera' | 'Film' | 'Photography';
  Geography: 'Physical Geography' | 'Political Geography' | 'World Geography' | 'US Geography';
  'Social Science': 'Economics' | 'Psychology' | 'Sociology' | 'Anthropology' | 'Political Science' | 'Law';
  'Current Events': 'US Current Events' | 'World Current Events' | 'Pop Culture';
  Mathematics: 'Algebra' | 'Geometry' | 'Calculus' | 'Statistics' | 'Number Theory' | 'Applied Math';
  Mythology: 'Greek/Roman' | 'Norse' | 'Egyptian' | 'Other Mythology';
  Philosophy: 'Ancient Philosophy' | 'Modern Philosophy' | 'Ethics' | 'Logic' | 'Metaphysics';
};

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
  subcategory?: string; // Granular subject for scoring breakdowns
  difficulty: QuestionDifficulty;
  text: string;
  powerMarkPosition: number; // character index for power mark (★)
  answer: string;
  acceptableAnswers: string[];
  explanation?: string;
  source?: QuestionSource; // Track question origin
  sourceId?: string; // Original ID from source (e.g., QB Reader _id)
}

// Bonus question part
export interface BonusPart {
  text: string;
  answer: string;
  acceptableAnswers: string[];
  pointValue?: number; // Points for this part (defaults to 10)
}

// Bonus question structure (always 3 parts)
export interface BonusQuestion {
  id: string;
  linkedTossupId: string;
  category: QuestionCategory;
  subcategory?: string; // Granular subject for scoring breakdowns
  difficulty: QuestionDifficulty;
  parts: [BonusPart, BonusPart, BonusPart]; // Exactly 3 parts
  leadin?: string; // Optional bonus leadin text
  source?: QuestionSource; // Track question origin
  sourceId?: string; // Original ID from source (e.g., QB Reader _id)
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
