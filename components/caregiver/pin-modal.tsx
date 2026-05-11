import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';

interface PinModalProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

export function PinModal({ onSubmit, onCancel }: PinModalProps) {
  const [pin, setPin] = useState('');

  const handleDigit = (digit: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => onSubmit(next), 100);
      }
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(p => p.slice(0, -1));
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>🔒 Caregiver PIN</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[styles.dot, pin.length > i && styles.dotFilled]}
            />
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {digits.map((d, i) => {
            if (d === '') return <View key={i} style={styles.keyEmpty} />;
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.key,
                  d === '⌫' && styles.keyDelete,
                  pressed && styles.keyPressed,
                ]}
                onPress={() => d === '⌫' ? handleDelete() : handleDigit(d)}
                accessibilityRole="button"
                accessibilityLabel={d === '⌫' ? 'Delete' : d}
              >
                <Text style={[styles.keyText, d === '⌫' && styles.keyDeleteText]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Cancel */}
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 40,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 48,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1565C0',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#1565C0',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDelete: {
    backgroundColor: '#FFEBEE',
  },
  keyEmpty: {
    width: 80,
    height: 80,
  },
  keyPressed: {
    backgroundColor: '#E0E0E0',
    transform: [{ scale: 0.95 }],
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  keyDeleteText: {
    color: '#D32F2F',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  cancelButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  cancelText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
});
