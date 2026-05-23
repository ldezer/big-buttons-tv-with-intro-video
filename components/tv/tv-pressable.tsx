import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export type TVPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean; hovered?: boolean; focused: boolean }) => StyleProp<ViewStyle>);
  focusStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
};

export function TVPressable({ children, style, focusStyle, pressedStyle, onFocus, onBlur, ...props }: TVPressableProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      focusable
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [
        typeof style === 'function' ? style({ ...state, focused }) : style,
        focused && (focusStyle ?? tvFocusStyles.focused),
        state.pressed && (pressedStyle ?? tvFocusStyles.pressed),
      ]}
    >
      {children}
    </Pressable>
  );
}

export const tvFocusStyles = StyleSheet.create({
  focused: {
    borderWidth: 7,
    borderColor: '#000000',
    transform: [{ scale: 1.05 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 32,
    zIndex: 100,
  },
  focusedSmall: {
    borderWidth: 5,
    borderColor: '#000000',
    transform: [{ scale: 1.06 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 28,
    zIndex: 100,
  },
  pressed: {
    opacity: 0.85,
  },
});
