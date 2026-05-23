import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { useApp } from '@/lib/app-context';
import { Profile } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PinModal } from '@/components/caregiver/pin-modal';
import { TVPressable, tvFocusStyles } from '@/components/tv/tv-pressable';

export default function CaregiverDashboard() {
  const router = useRouter();
  const { profiles } = useProfiles();
  const { settings, isCaregiverUnlocked, unlockCaregiver } = useApp();
  const [showPin, setShowPin] = useState(!isCaregiverUnlocked && !!settings.caregiverPin);

  const handlePinSubmit = (pin: string) => {
    const success = unlockCaregiver(pin);
    if (success) {
      setShowPin(false);
    } else {
      Alert.alert('Wrong PIN', 'Please try again.');
    }
  };

  const handleAddProfile = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/caregiver/profile-edit');
  };

  const handleEditProfile = (profile: Profile) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/caregiver/profile-edit', params: { profileId: profile.id } });
  };

  const handleEditButtons = (profile: Profile) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/caregiver/buttons/${profile.id}`);
  };

  const handleQuickPacks = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/caregiver/quick-packs');
  };

  const handleSettings = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/caregiver/settings');
  };

  const handleBack = () => {
    router.back();
  };

  if (showPin) {
    return (
      <PinModal
        onSubmit={handlePinSubmit}
        onCancel={handleBack}
      />
    );
  }

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TVPressable
          style={({ pressed, focused }: any) => [styles.backButton, focused && styles.tvFocused, pressed && styles.backButtonPressed]}
         
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
        </TVPressable>
        <Text style={styles.headerTitle}>Caregiver Setup</Text>
        <TVPressable
          style={({ pressed, focused }: any) => [styles.settingsButton, focused && styles.tvFocused, pressed && styles.settingsButtonPressed]}
         
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <IconSymbol name="gearshape.fill" size={24} color="#757575" />
        </TVPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profiles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profiles</Text>
            <TVPressable
              style={({ pressed, focused }: any) => [styles.addButton, focused && styles.tvFocused, pressed && styles.addButtonPressed]}
              hasTVPreferredFocus
              onPress={handleAddProfile}
              accessibilityRole="button"
              accessibilityLabel="Add new profile"
            >
              <IconSymbol name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Profile</Text>
            </TVPressable>
          </View>

          {profiles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👤</Text>
              <Text style={styles.emptyText}>No profiles yet. Add one to get started!</Text>
            </View>
          ) : (
            <View style={styles.profileList}>
              {profiles.map(profile => (
                <View key={profile.id} style={[styles.profileCard, { borderLeftColor: profile.color }]}>
                  <View style={styles.profileCardLeft}>
                    <View style={[styles.profileAvatar, { backgroundColor: profile.color }]}>
                      <Text style={styles.profileAvatarEmoji}>{profile.emoji}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileCardName}>{profile.name}</Text>
                      <Text style={styles.profileCardMeta}>
                        {profile.buttons.length} button{profile.buttons.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.profileCardActions}>
                    <TVPressable
                      style={({ pressed, focused }: any) => [styles.cardAction, focused && styles.tvFocused, pressed && styles.cardActionPressed]}
                      onPress={() => handleEditButtons(profile)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit buttons for ${profile.name}`}
                    >
                      <IconSymbol name="square.grid.2x2.fill" size={20} color="#1565C0" />
                      <Text style={styles.cardActionText}>Buttons</Text>
                    </TVPressable>
                    <TVPressable
                      style={({ pressed, focused }: any) => [styles.cardAction, focused && styles.tvFocused, pressed && styles.cardActionPressed]}
                      onPress={() => handleEditProfile(profile)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit profile for ${profile.name}`}
                    >
                      <IconSymbol name="pencil" size={20} color="#757575" />
                      <Text style={[styles.cardActionText, { color: '#757575' }]}>Edit</Text>
                    </TVPressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Packs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Packs</Text>
          <TVPressable
            style={({ pressed, focused }: any) => [styles.quickPacksCard, focused && styles.tvFocused, pressed && styles.quickPacksCardPressed]}
           
            onPress={handleQuickPacks}
            accessibilityRole="button"
            accessibilityLabel="Browse quick packs"
          >
            <Text style={styles.quickPacksEmoji}>⚡</Text>
            <View style={styles.quickPacksInfo}>
              <Text style={styles.quickPacksTitle}>Browse Button Packs</Text>
              <Text style={styles.quickPacksSubtitle}>
                Animals, Food, Activities, Feelings & more
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </TVPressable>
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
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonPressed: {
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1565C0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#757575',
    flex: 1,
    lineHeight: 22,
  },
  profileList: {
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
  },
  profileCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarEmoji: {
    fontSize: 26,
  },
  profileInfo: {
    flex: 1,
  },
  profileCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  profileCardMeta: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  profileCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardAction: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  cardActionPressed: {
    backgroundColor: '#E0E0E0',
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1565C0',
  },
  quickPacksCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F9A825',
  },
  quickPacksCardPressed: {
    opacity: 0.8,
  },
  quickPacksEmoji: {
    fontSize: 36,
  },
  quickPacksInfo: {
    flex: 1,
  },
  quickPacksTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  quickPacksSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  tvFocused: { ...tvFocusStyles.focused },
  selectionBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    elevation: 10,
  },
  selectionText: {
    fontSize: Platform.isTV ? 24 : 17,
    fontWeight: '900',
    color: '#1565C0',
    textAlign: 'center',
  },
});
