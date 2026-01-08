import { QuizSession } from './quiz';

// Quiz Stack navigation
export type QuizStackParamList = {
  QuizLaunch: undefined;
  Quiz: undefined;
  QuizResults: {
    session: QuizSession;
  };
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends QuizStackParamList {}
  }
}
