import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/app-context';
import { FontSize, ColumnCount } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, lockCaregiver } = useApp();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSetPin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }
    updateSettings({ caregiverPin: newPin });
    setNewPin('');
    setConfirmPin('');
    setShowPinSetup(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('PIN Set', 'Caregiver PIN has been set successfully.');
  };

  const handleRemovePin = () => {
    Alert.alert(
      'Remove PIN',
      'Are you sure you want to remove the caregiver PIN? Anyone will be able to access caregiver settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove PIN',
          style: 'destructive',
          onPress: () => {
            updateSettings({ caregiverPin: null });
            lockCaregiver();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed, focused }) => [styles.headerBtn, focused && styles.tvFocusedSmall, pressed && styles.headerBtnPressed]}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Default Font Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Button Text Size</Text>
          <Text style={styles.sectionSubtitle}>Applied to new profiles</Text>
          <View style={styles.segmentRow}>
            {(['large', 'xlarge', 'xxlarge'] as FontSize[]).map(fs => (
              <Pressable
                key={fs}
                style={({ pressed }) => [
                  styles.segment,
                  settings.defaultFontSize === fs && styles.segmentActive,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => updateSettings({ defaultFontSize: fs })}
              >
                <Text style={[styles.segmentText, settings.defaultFontSize === fs && styles.segmentTextActive]}>
                  {fs === 'large' ? 'Large' : fs === 'xlarge' ? 'X-Large' : 'XX-Large'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Default Columns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Button Columns</Text>
          <Text style={styles.sectionSubtitle}>Applied to new profiles</Text>
          <View style={styles.segmentRow}>
            {([1, 2, 3] as ColumnCount[]).map(c => (
              <Pressable
                key={c}
                style={({ pressed }) => [
                  styles.segment,
                  settings.defaultColumns === c && styles.segmentActive,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => updateSettings({ defaultColumns: c })}
              >
                <Text style={[styles.segmentText, settings.defaultColumns === c && styles.segmentTextActive]}>
                  {c} {c === 1 ? 'Column' : 'Columns'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Default Spoken Labels */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.sectionTitle}>Default Spoken Labels</Text>
              <Text style={styles.sectionSubtitle}>Read button labels aloud by default</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.toggle,
                settings.defaultSpokenLabels && styles.toggleOn,
                pressed && styles.togglePressed,
              ]}
              onPress={() => updateSettings({ defaultSpokenLabels: !settings.defaultSpokenLabels })}
            >
              <View style={[styles.toggleThumb, settings.defaultSpokenLabels && styles.toggleThumbOn]} />
            </Pressable>
          </View>
        </View>

        {/* PIN Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Caregiver PIN</Text>
          <Text style={styles.sectionSubtitle}>
            {settings.caregiverPin
              ? 'A PIN is set. Caregivers must enter it to access settings.'
              : 'No PIN set. Anyone can access caregiver settings.'}
          </Text>

          {!showPinSetup ? (
            <View style={styles.pinActions}>
              <Pressable
                style={({ pressed, focused }) => [styles.pinButton, focused && styles.tvFocused, pressed && styles.pinButtonPressed]}
                onPress={() => setShowPinSetup(true)}
              >
                <IconSymbol name="lock.fill" size={18} color="#FFFFFF" />
                <Text style={styles.pinButtonText}>
                  {settings.caregiverPin ? 'Change PIN' : 'Set PIN'}
                </Text>
              </Pressable>
              {settings.caregiverPin && (
                <Pressable
                  style={({ pressed, focused }) => [styles.removePinButton, focused && styles.tvFocused, pressed && styles.removePinButtonPressed]}
                  onPress={handleRemovePin}
                >
                  <IconSymbol name="lock.open.fill" size={18} color="#D32F2F" />
                  <Text style={styles.removePinButtonText}>Remove PIN</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.pinSetup}>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={t => setNewPin(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="New PIN (4 digits)"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                returnKeyType="next"
              />
              <TextInput
                style={styles.pinInput}
                value={confirmPin}
                onChangeText={t => setConfirmPin(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="Confirm PIN"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={handleSetPin}
              />
              <View style={styles.pinSetupActions}>
                <Pressable
                  style={({ pressed, focused }) => [styles.pinButton, focused && styles.tvFocused, pressed && styles.pinButtonPressed]}
                  onPress={handleSetPin}
                >
                  <Text style={styles.pinButtonText}>Save PIN</Text>
                </Pressable>
                <Pressable
                  style={({ pressed, focused }) => [styles.cancelBtn, focused && styles.tvFocused, pressed && styles.cancelBtnPressed]}
                  onPress={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Big Buttons</Text>
          <View style={styles.aboutCard}>
            <Image source={require('@/assets/images/custom/big-buttons-logo.jpg')} style={styles.aboutLogo} resizeMode="contain" />
            <Text style={styles.aboutText}>
              A caregiver-made giant-button launcher for autistic users, people with I/DD, elderly users, and anyone who benefits from simple, accessible technology.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: {
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
    gap: 28,
    paddingBottom: 48,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: -6,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1565C0',
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  segmentTextActive: {
    color: '#1565C0',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
    gap: 4,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#BDBDBD',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: '#1565C0',
  },
  togglePressed: {
    opacity: 0.8,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  pinActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  pinButtonPressed: {
    opacity: 0.8,
  },
  pinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removePinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
  },
  removePinButtonPressed: {
    opacity: 0.8,
  },
  removePinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D32F2F',
  },
  pinSetup: {
    gap: 12,
  },
  pinInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    letterSpacing: 8,
  },
  pinSetupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  cancelBtnPressed: {
    backgroundColor: '#F5F5F5',
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },
  tvFocused: { borderWidth: 5, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 16, elevation: 16, transform: [{ scale: 1.03 }] },
  tvFocusedSmall: { borderWidth: 4, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 12, elevation: 14, transform: [{ scale: 1.08 }] },
  aboutCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  aboutLogo: { width: 260, height: 130, alignSelf: 'center' },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1565C0',
  },
  aboutText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 22,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 4,
  },
});
