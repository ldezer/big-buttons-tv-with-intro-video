import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { TVPressable, tvFocusStyles } from '@/components/tv/tv-pressable';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;
  /**
   * When true the focus manager will set initial focus to this button.
   * Usually you want the form's first field to keep initial focus, so default
   * is false.
   */
  hasTVPreferredFocus?: boolean;
};

/**
 * A fixed-position save bar pinned to the bottom of the screen. It sits on
 * top of any ScrollView content, has a very high zIndex, and stays visible
 * regardless of where the user has scrolled. It also shows a hint reminding
 * the user that the MENU button on their TV remote will trigger save.
 */
export function StickySaveBar({ label, onPress, disabled, hint, hasTVPreferredFocus }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={styles.barShadow} pointerEvents="none" />
      <View style={styles.bar}>
        <View style={styles.hintWrap}>
          <Text style={styles.hintText} numberOfLines={2}>
            {hint ?? 'Tip: Press the MENU button on your remote to save.'}
          </Text>
        </View>
        <TVPressable
          focusId="sticky-save-button"
          hasTVPreferredFocus={hasTVPreferredFocus}
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed, focused }: any) => [
            styles.button,
            focused && tvFocusStyles.focused,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <IconSymbol name="checkmark" size={Platform.isTV ? 30 : 22} color="#FFFFFF" />
          <Text style={styles.buttonText}>{label}</Text>
        </TVPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Platform.isTV ? 36 : 16,
    paddingBottom: Platform.isTV ? 28 : 18,
    paddingTop: Platform.isTV ? 18 : 14,
    zIndex: 9999,
    elevation: 50,
  },
  barShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#111111',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 50,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Platform.isTV ? 24 : 12,
  },
  hintWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  hintText: {
    fontSize: Platform.isTV ? 18 : 13,
    color: '#444444',
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.isTV ? 14 : 10,
    backgroundColor: '#111111',
    borderRadius: 22,
    paddingVertical: Platform.isTV ? 22 : 14,
    paddingHorizontal: Platform.isTV ? 36 : 24,
    borderWidth: 4,
    borderColor: '#111111',
    minWidth: Platform.isTV ? 260 : 160,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
    borderColor: '#888888',
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Platform.isTV ? 28 : 20,
    fontWeight: '900',
  },
});
