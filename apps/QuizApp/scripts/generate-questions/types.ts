/**
 * Type definitions for question generation scripts
 */

// QB Reader API response types
export interface QBReaderTossup {
  _id: string;
  question: string;
  question_sanitized?: string;
  answer: string;
  answer_sanitized?: string;
  category: string;
  subcategory?: string;
  alternate_subcategory?: string;
  difficulty: number;
  number?: number;
  packet?: {
    name: string;
    number: number;
  };
  set?: {
    name: string;
    year: number;
    standard?: boolean;
  };
  updatedAt?: string;
}

export interface QBReaderBonus {
  _id: string;
  leadin: string;
  leadin_sanitized?: string;
  parts: string[];
  parts_sanitized?: string[];
  answers: string[];
  answers_sanitized?: string[];
  category: string;
  subcategory?: string;
  alternate_subcategory?: string;
  difficulty: number;
  number?: number;
  packet?: {
    name: string;
    number: number;
  };
  set?: {
    name: string;
    year: number;
    standard?: boolean;
  };
  updatedAt?: string;
}

export interface QBReaderQueryResponse {
  tossups?: {
    count: number;
    questionArray: QBReaderTossup[];
  };
  bonuses?: {
    count: number;
    questionArray: QBReaderBonus[];
  };
  queryString?: string;
}

export interface QBReaderRandomResponse {
  tossups?: QBReaderTossup[];
  bonuses?: QBReaderBonus[];
}

// App question types (matching quiz.ts)
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

export type QuestionDifficulty = 'middle_school' | 'high_school' | 'college' | 'open';

export type QuestionSource = 'qbreader' | 'ai-generated' | 'manual';

export interface TossupQuestion {
  id: string;
  category: QuestionCategory;
  subcategory?: string;
  difficulty: QuestionDifficulty;
  text: string;
  powerMarkPosition: number;
  answer: string;
  acceptableAnswers: string[];
  explanation?: string;
  source?: QuestionSource;
  sourceId?: string;
}

export interface BonusPart {
  text: string;
  answer: string;
  acceptableAnswers: string[];
  pointValue?: number;
}

export interface BonusQuestion {
  id: string;
  linkedTossupId: string;
  category: QuestionCategory;
  subcategory?: string;
  difficulty: QuestionDifficulty;
  parts: [BonusPart, BonusPart, BonusPart];
  leadin?: string;
  source?: QuestionSource;
  sourceId?: string;
}

export interface QuizData {
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

// Packet format
export interface Packet {
  packetId: string;
  version: string;
  generatedAt: string;
  difficulty: QuestionDifficulty | 'mixed';
  categories: QuestionCategory[];
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

// Metadata format
export interface PacketMetadata {
  id: string;
  file: string;
  difficulty: QuestionDifficulty | 'mixed';
  categories: QuestionCategory[];
  tossupCount: number;
  bonusCount: number;
}

export interface CategoryStats {
  tossups: number;
  bonuses: number;
}

export interface QuestionsMetadata {
  version: string;
  generatedAt: string;
  totalPackets: number;
  totalTossups: number;
  totalBonuses: number;
  packets: PacketMetadata[];
  categoryStats: Record<QuestionCategory, CategoryStats>;
}

// Generation progress tracking
export interface GenerationProgress {
  completedCategories: string[];
  completedDifficulties: string[];
  questionsGenerated: {
    tossups: number;
    bonuses: number;
  };
  lastCheckpoint: string;
  errors: Array<{ category: string; error: string; timestamp: string }>;
}

// Parsed answer result
export interface ParsedAnswer {
  primaryAnswer: string;
  acceptableAnswers: string[];
}

// Fetch parameters
export interface FetchParams {
  categories?: string[];
  subcategories?: string[];
  difficulties?: number[];
  questionType?: 'tossup' | 'bonus' | 'all';
  minYear?: number;
  maxYear?: number;
  standardOnly?: boolean;
  threePartBonuses?: boolean;
  number?: number;
  randomize?: boolean;
}
