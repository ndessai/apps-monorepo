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
  Quiz: { isOnboarding?: boolean } | undefined;
  QuizResults: {
    session: SerializableQuizSession;
    isOnboarding?: boolean;
  };
  Settings: NavigatorScreenParams<SettingsTabParamList>;
};

// Onboarding Stack navigation
export type OnboardingStackParamList = {
  Welcome: undefined;
  ThemeSelection: undefined;
  VoiceSettings: undefined;
  TimerSettings: undefined;
  SampleQuizIntro: undefined;
  Quiz: { isOnboarding: true };
  QuizResults: {
    session: SerializableQuizSession;
    isOnboarding: true;
  };
};

// Root Navigator param list
export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<QuizStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
