import { NavigatorScreenParams } from '@react-navigation/native';
import { TossupResult, BonusResult } from './quiz';

// Serializable version of QuizSession for navigation
export interface SerializableQuizSession {
  tossupResults: TossupResult[];
  bonusResults: BonusResult[];
  totalScore: number;
  maxScore: number;
  completedAt: string; // ISO date string instead of Date
}

// Settings Tab Navigator param list
export type SettingsTabParamList = {
  Profile: undefined;
  Teams: undefined;
  Badges: undefined;
  History: undefined;
  QuizSetup: undefined;
};

// Quiz Stack navigation
export type QuizStackParamList = {
  QuizLaunch: undefined;
  Quiz: undefined;
  QuizResults: {
    session: SerializableQuizSession;
  };
  Settings: NavigatorScreenParams<SettingsTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends QuizStackParamList {}
  }
}
