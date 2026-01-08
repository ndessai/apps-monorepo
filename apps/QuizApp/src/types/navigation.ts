import { BottomTabParamList } from '../navigation/BottomTabNavigator';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends BottomTabParamList {}
  }
}

export type { BottomTabParamList };
