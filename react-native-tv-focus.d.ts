import 'react-native';

declare module 'react-native' {
  interface PressableStateCallbackType {
    focused?: boolean;
  }

  interface PressableProps {
    focusable?: boolean;
    hasTVPreferredFocus?: boolean;
  }
}
