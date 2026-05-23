import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export type TVPressableState = { pressed: boolean; hovered?: boolean; focused: boolean };
export type TVPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: TVPressableState) => StyleProp<ViewStyle>);
  focusStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
};

/**
 * One focus/hover wrapper for Android TV + mouse/web.
 * The focused/hovered state is applied by onFocus/onBlur and onHoverIn/onHoverOut,
 * not by guessing or debug labels. Any screen using this component gets the same
 * thick black TV-style moving selection box.
 */
export function TVPressable({
  children,
  style,
  focusStyle,
  pressedStyle,
  disabledStyle,
  disabled,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  ...props
}: TVPressableProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = !disabled && (focused || hovered);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      focusable={!disabled}
      accessible
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={(state) => [
        typeof style === 'function' ? style({ ...state, focused: active, hovered }) : style,
        active && (focusStyle ?? tvFocusStyles.focused),
        state.pressed && (pressedStyle ?? tvFocusStyles.pressed),
        disabled && (disabledStyle ?? tvFocusStyles.disabled),
      ]}
    >
      {children}
    </Pressable>
  );
}

export const tvFocusStyles = StyleSheet.create({
  focused: {
    borderWidth: 8,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.07 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 40,
    zIndex: 999,
  },
  focusedSmall: {
    borderWidth: 6,
    borderColor: '#000000',
    transform: [{ scale: 1.1 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 36,
    zIndex: 999,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.38,
  },
});
