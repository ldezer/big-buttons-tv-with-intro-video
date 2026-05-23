import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as WebBrowser from 'expo-web-browser';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { BigButton } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cleanImageUri, getBundledButtonArt } from '@/lib/art';
import { TVPressable, tvFocusStyles } from '@/components/tv/tv-pressable';

function getButtonSize(screenWidth: number, screenHeight: number): number {
  if (Platform.isTV) {
    const sizeFromWidth = (screenWidth - 260) / 4;
    const sizeFromHeight = (screenHeight - 330) / 1.45;
    return Math.max(175, Math.min(sizeFromWidth, sizeFromHeight, 245));
  }
  return Math.max(142, Math.min((screenWidth - 60) / 2, 220));
}

function defaultArtKeyForIndex(index: number): string {
  return `button-art-${(index % 4) + 1}`;
}

export default function LovedOneMode() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const { getProfile } = useProfiles();
  const { width, height } = useWindowDimensions();
  useKeepAwake();
  const profile = getProfile(profileId);

  const handleButtonPress = useCallback(async (button: BigButton) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (profile?.settings.spokenLabels) Speech.speak(button.label, { language: 'en', rate: 0.85 });
    const action = button.action;
    switch (action.type) {
      case 'google-images': await WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${encodeURIComponent(action.query)}&tbm=isch&safe=active`); break;
      case 'youtube': await WebBrowser.openBrowserAsync(`https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`); break;
      case 'choice': router.push({ pathname: '/action/choice', params: { query: action.query, label: button.label } }); break;
      case 'url': await WebBrowser.openBrowserAsync(action.url); break;
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <ScreenContainer containerClassName="bg-white">
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#000000" /></View>
      </ScreenContainer>
    );
  }

  const buttonSize = getButtonSize(width, height);
  const sortedButtons = [...profile.buttons].sort((a, b) => a.order - b.order).slice(0, 4);
  const backgroundSource = cleanImageUri(profile.backgroundImageUri) ? { uri: cleanImageUri(profile.backgroundImageUri) } : null;

  const content = (
    <View style={styles.screenBody}>
      <Image source={require('@/assets/images/custom/big-buttons-logo.jpg')} style={styles.logoImage} resizeMode="contain" />

      {sortedButtons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No buttons yet</Text>
          <Text style={styles.emptyText}>Use Create Buttons below to add buttons.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {sortedButtons.map((button, index) => {
            const remote = cleanImageUri(button.imageUri);
            const forceEmoji = button.bundledArtKey === 'emoji-only';
            const artSource = forceEmoji ? null : (remote ? { uri: remote } : getBundledButtonArt(button.bundledArtKey || defaultArtKeyForIndex(index)));
            return (
              <TVPressable
                key={button.id}
                hasTVPreferredFocus={index === 0}
                style={[styles.buttonFocusFrame, { width: buttonSize, height: buttonSize }]}
                focusStyle={styles.buttonFocused}
                onPress={() => handleButtonPress(button)}
                accessibilityRole="button"
                accessibilityLabel={button.label}
              >
                {artSource ? (
                  <ImageBackground
                    source={artSource}
                    style={styles.bigButtonArt}
                    imageStyle={styles.bigButtonImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.bigButtonArt, styles.emojiButton, { backgroundColor: button.color }]}> 
                    <Text style={styles.buttonEmoji}>{button.emoji || '⭐'}</Text>
                  </View>
                )}
              </TVPressable>
            );
          })}
        </View>
      )}

      <View style={styles.adminControls}>
        <TVPressable
          style={styles.adminButton}
          focusStyle={styles.adminFocused}
          onPress={() => router.push('/caregiver/profile-edit')}
          accessibilityRole="button"
          accessibilityLabel="Create Profile"
        >
          <IconSymbol name="plus" size={24} color="#111111" />
          <Text style={styles.adminButtonText}>Create Profile</Text>
        </TVPressable>
        <TVPressable
          style={styles.adminButton}
          focusStyle={styles.adminFocused}
          onPress={() => router.push({ pathname: '/caregiver/profile-edit', params: { profileId: profile.id } })}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
        >
          <IconSymbol name="pencil" size={24} color="#111111" />
          <Text style={styles.adminButtonText}>Edit Profile</Text>
        </TVPressable>
        <TVPressable
          style={styles.adminButton}
          focusStyle={styles.adminFocused}
          onPress={() => router.push(`/caregiver/buttons/${profile.id}`)}
          accessibilityRole="button"
          accessibilityLabel="Create or edit buttons"
        >
          <IconSymbol name="square.grid.2x2.fill" size={24} color="#111111" />
          <Text style={styles.adminButtonText}>Create Buttons</Text>
        </TVPressable>
        <TVPressable
          style={styles.adminButton}
          focusStyle={styles.adminFocused}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <IconSymbol name="arrow.left" size={24} color="#111111" />
          <Text style={styles.adminButtonText}>Back</Text>
        </TVPressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top','left','right','bottom']}>
      {backgroundSource ? <ImageBackground source={backgroundSource} style={styles.fullBg} imageStyle={styles.fullBgImage}>{content}</ImageBackground> : content}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fullBg: { flex: 1 },
  fullBgImage: { opacity: 0.10 },
  screenBody: {
    flex: 1,
    paddingHorizontal: Platform.isTV ? 72 : 18,
    paddingTop: Platform.isTV ? 22 : 14,
    paddingBottom: Platform.isTV ? 24 : 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: Platform.isTV ? 260 : 190,
    height: Platform.isTV ? 150 : 105,
    marginBottom: Platform.isTV ? 36 : 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Platform.isTV ? 36 : 14,
    marginBottom: Platform.isTV ? 42 : 24,
  },
  buttonFocusFrame: {
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#DADCE0',
    padding: 8,
    overflow: 'visible',
  },
  buttonFocused: {
    ...tvFocusStyles.focused,
    borderWidth: 9,
    borderColor: '#000000',
    borderRadius: 38,
  },
  bigButtonArt: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  bigButtonImage: { borderRadius: 26 },
  emojiButton: { padding: 16 },
  buttonEmoji: { fontSize: Platform.isTV ? 100 : 64, lineHeight: Platform.isTV ? 110 : 72 },
  adminControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: Platform.isTV ? 18 : 10,
    width: '100%',
  },
  adminButton: {
    minWidth: Platform.isTV ? 205 : 138,
    borderRadius: 26,
    paddingVertical: Platform.isTV ? 19 : 14,
    paddingHorizontal: Platform.isTV ? 22 : 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#DADCE0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    overflow: 'visible',
  },
  adminFocused: {
    ...tvFocusStyles.focused,
    borderWidth: 7,
    borderColor: '#000000',
    borderRadius: 30,
  },
  adminButtonText: { color: '#111111', fontSize: Platform.isTV ? 21 : 16, fontWeight: '900' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginBottom: 28 },
  emptyTitle: { fontSize: Platform.isTV ? 30 : 24, fontWeight: '900', color: '#1A1A1A', marginBottom: 12 },
  emptyText: { fontSize: Platform.isTV ? 20 : 16, color: '#757575', textAlign: 'center', lineHeight: 26 },
});
