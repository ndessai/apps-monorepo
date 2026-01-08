import { TossupResult, BonusResult } from './quiz';

// Serializable version of QuizSession for navigation
export interface SerializableQuizSession {
  tossupResults: TossupResult[];
  bonusResults: BonusResult[];
  totalScore: number;
  maxScore: number;
  completedAt: string; // ISO date string instead of Date
}

// Quiz Stack navigation
export type QuizStackParamList = {
  QuizLaunch: undefined;
  Quiz: undefined;
  QuizResults: {
    session: SerializableQuizSession;
  };
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends QuizStackParamList {}
  }
}
