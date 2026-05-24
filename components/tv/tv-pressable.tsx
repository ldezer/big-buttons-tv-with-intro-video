import React, { useCallback, useState } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useFocusable } from '@/lib/tv-focus/focus-manager';

export type TVPressableState = { pressed: boolean; hovered?: boolean; focused: boolean };
export type TVPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: TVPressableState) => StyleProp<ViewStyle>);
  focusStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  /** Optional explicit focus id. Random one is generated if omitted. */
  focusId?: string;
  /** When true the focus manager sets initial focus to this element. */
  hasTVPreferredFocus?: boolean;
};

/**
 * Unified focus / press wrapper.
 *
 * Why this exists: stock react-native (not the tvos fork) does not reliably
 * fire Pressable.onFocus from an Android TV / Fire TV D-pad. Without that,
 * the user can never tell where the remote is pointing. To fix this, every
 * TVPressable registers itself with the FocusManager. The manager listens
 * for hardware D-pad / MENU / CENTER events surfaced from MainActivity (see
 * plugins/withTVKeyEvents.js) and drives focus in JS.
 *
 * The element renders its own visible focus styling AND the FocusProvider
 * also draws a screen-level yellow ring at the focused element's rect. Either
 * is enough on its own; together the focus indicator can not be missed.
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
  onPress,
  onLayout,
  hasTVPreferredFocus,
  focusId,
  ...props
}: TVPressableProps) {
  const [nativeFocused, setNativeFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSelect = useCallback(() => {
    if (disabled) return;
    onPress?.({} as any);
  }, [disabled, onPress]);

  const { focused: managerFocused, viewRef, onLayout: registerLayout, requestFocus } = useFocusable({
    id: focusId,
    preferred: !!hasTVPreferredFocus && !disabled,
    onSelect: handleSelect,
  });

  const active = !disabled && (managerFocused || nativeFocused || hovered);

  return (
    <Pressable
      {...props}
      ref={viewRef as unknown as React.Ref<View>}
      onLayout={(event) => {
        registerLayout();
        onLayout?.(event);
      }}
      disabled={disabled}
      focusable={!disabled}
      accessible
      onFocus={(event) => {
        setNativeFocused(true);
        requestFocus();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setNativeFocused(false);
        onBlur?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        requestFocus();
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onPress={(event) => {
        requestFocus();
        onPress?.(event);
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

/**
 * Local focus styles. The big visible yellow ring is also drawn at the screen
 * level by FocusProvider; this provides a fallback inner emphasis that lives
 * inside the element so it's visible the instant focus changes.
 *
 * Note: we deliberately use only border + shadow here, no transform scale.
 * Scale can be clipped by parents with overflow: hidden and can also throw
 * off measureInWindow on some renderers. The yellow global ring carries the
 * heavy lifting; the inner black border is the safety net.
 */
export const tvFocusStyles = StyleSheet.create({
  focused: {
    borderWidth: 6,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 32,
    zIndex: 999,
  },
  focusedSmall: {
    borderWidth: 5,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 28,
    zIndex: 999,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
