import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Platform, ActivityIndicator, ImageBackground, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as WebBrowser from 'expo-web-browser';
import { useKeepAwake } from 'expo-keep-awake';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { BigButton, FONT_SIZE_MAP } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cleanImageUri, getBundledButtonArt, getBundledProfileArt } from '@/lib/art';

function getButtonSize(columns: number, screenWidth: number, screenHeight: number): number {
  const safeColumns = Math.max(1, Math.min(columns || 2, 2));
  const horizontalPadding = Platform.isTV ? 80 * 2 : 20 * 2;
  const gap = Platform.isTV ? 28 : 14;
  const widthSize = (screenWidth - horizontalPadding - gap * (safeColumns - 1)) / safeColumns;
  const heightSize = Platform.isTV ? (screenHeight - 330) / 2 : widthSize;
  return Math.max(142, Math.min(widthSize, heightSize, Platform.isTV ? 300 : widthSize));
}

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
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

  const columns = Math.max(1, Math.min(profile.settings.columns || 2, 2));
  const buttonSize = getButtonSize(columns, width, height);
  const fontSize = FONT_SIZE_MAP[profile.settings.fontSize];
  const sortedButtons = [...profile.buttons].sort((a, b) => a.order - b.order).slice(0, 4);
  const bannerSource = cleanImageUri(profile.bannerImageUri) ? { uri: cleanImageUri(profile.bannerImageUri) } : getBundledProfileArt(profile.bannerBundledArtKey);
  const avatarSource = cleanImageUri(profile.avatarImageUri) ? { uri: cleanImageUri(profile.avatarImageUri) } : getBundledProfileArt(profile.avatarBundledArtKey);
  const backgroundSource = cleanImageUri(profile.backgroundImageUri) ? { uri: cleanImageUri(profile.backgroundImageUri) } : null;

  const content = (
    <View style={styles.screenBody}>
      {bannerSource ? (
        <ImageBackground source={bannerSource} style={styles.banner} imageStyle={styles.bannerImage} resizeMode="contain" />
      ) : (
        <View style={styles.bannerPlain}>
          {avatarSource ? (
            <ImageBackground source={avatarSource} style={styles.avatarImage} imageStyle={styles.avatarImageInner} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: profile.color }]}>
              <Text style={styles.avatarFallbackEmoji}>{profile.emoji}</Text>
            </View>
          )}
          <View style={styles.bannerTextWrap}>
            <Text style={[styles.bannerTitlePlain, { color: profile.color }]}>{profile.name}</Text>
            <Text style={styles.bannerSubtitlePlain}>Choose a button</Text>
          </View>
        </View>
      )}

      {sortedButtons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔧</Text>
          <Text style={styles.emptyTitle}>No buttons yet</Text>
          <Text style={styles.emptyText}>Use Edit Profile to add buttons.</Text>
        </View>
      ) : (
        <View style={[styles.grid, { gap: Platform.isTV ? 28 : 14 }]}> 
          {sortedButtons.map((button, index) => {
            const remote = cleanImageUri(button.imageUri);
            const forceEmoji = button.bundledArtKey === 'emoji-only';
            const artSource = forceEmoji ? null : (remote ? { uri: remote } : getBundledButtonArt(button.bundledArtKey || defaultArtKeyForIndex(index)));
            const textColor = artSource ? '#111111' : getTextColor(button.color);
            return (
              <Pressable
                key={button.id}
                hasTVPreferredFocus={index === 0}
                focusable
                style={({ pressed, focused }) => [
                  styles.buttonWrap,
                  { width: buttonSize, height: buttonSize },
                  focused && styles.tvFocused,
                  pressed && styles.bigButtonPressed,
                ]}
                onPress={() => handleButtonPress(button)}
                accessibilityLabel={button.label}
              >
                {artSource ? (
                  <ImageBackground
                    source={artSource}
                    style={[styles.bigButton, { backgroundColor: '#FFFFFF', width: buttonSize, height: buttonSize }]}
                    imageStyle={styles.bigButtonImage}
                    resizeMode="cover"
                  >
                    <View style={styles.imageButtonLabelPill}>
                      <Text style={[styles.buttonLabel, { color: textColor, fontSize: Math.max(18, fontSize - 6) }]} numberOfLines={1} adjustsFontSizeToFit>
                        {button.label}
                      </Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={[styles.bigButton, { backgroundColor: button.color, width: buttonSize, height: buttonSize }]}>
                    {button.emoji ? <Text style={styles.buttonEmoji}>{button.emoji}</Text> : null}
                    <Text style={[styles.buttonLabel, { color: textColor, fontSize }]} numberOfLines={2} adjustsFontSizeToFit>{button.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.profileActionsRow}>
        <Pressable
          focusable
          style={({ pressed, focused }) => [styles.profileAction, focused && styles.tvFocused, pressed && styles.profileActionPressed]}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <IconSymbol name="arrow.left" size={22} color="#111111" />
          <Text style={styles.profileActionText}>Back</Text>
        </Pressable>
        <Pressable
          focusable
          style={({ pressed, focused }) => [styles.profileAction, styles.profileActionPrimary, focused && styles.tvFocused, pressed && styles.profileActionPressed]}
          onPress={() => router.push('/caregiver')}
          accessibilityLabel="Edit Profile"
        >
          <Text style={styles.profileActionTextPrimary}>Edit Profile</Text>
        </Pressable>
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
  fullBgImage: { opacity: 0.12 },
  screenBody: { flex: 1, paddingHorizontal: Platform.isTV ? 72 : 18, paddingTop: Platform.isTV ? 20 : 14, paddingBottom: Platform.isTV ? 26 : 18, backgroundColor: 'transparent' },
  tvFocused: { borderWidth: 6, borderColor: '#000000', transform: [{ scale: 1.035 }], shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 18, elevation: 20, zIndex: 20 },
  banner: { alignSelf: 'center', width: '100%', maxWidth: 980, height: Platform.isTV ? 124 : 118, borderRadius: 22, overflow: 'hidden', backgroundColor: '#FFFFFF', marginBottom: Platform.isTV ? 22 : 16 },
  bannerImage: { borderRadius: 22 },
  bannerPlain: { alignSelf: 'center', width: '100%', maxWidth: 980, minHeight: Platform.isTV ? 112 : 100, borderRadius: 22, backgroundColor: '#F4F7FB', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Platform.isTV ? 22 : 16 },
  bannerTextWrap: { flex: 1 },
  bannerTitlePlain: { fontSize: Platform.isTV ? 32 : 26, fontWeight: '900' },
  bannerSubtitlePlain: { fontSize: Platform.isTV ? 18 : 15, color: '#5F6368', marginTop: 4, fontWeight: '700' },
  avatarImage: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden' },
  avatarImageInner: { borderRadius: 20 },
  avatarFallback: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackEmoji: { fontSize: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', flexGrow: 1, paddingVertical: Platform.isTV ? 6 : 4 },
  buttonWrap: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E8EAED' },
  bigButton: { borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  bigButtonImage: { borderRadius: 22 },
  imageButtonLabelPill: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 2, borderColor: '#111111', borderRadius: 18, paddingVertical: 7, paddingHorizontal: 12, alignItems: 'center' },
  bigButtonPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  buttonEmoji: { fontSize: Platform.isTV ? 78 : 52, marginBottom: 8, lineHeight: Platform.isTV ? 88 : 60 },
  buttonLabel: { fontWeight: '900', textAlign: 'center', lineHeight: Platform.isTV ? 30 : 26 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', lineHeight: 24 },
  profileActionsRow: { flexDirection: 'row', justifyContent: 'center', gap: Platform.isTV ? 28 : 12, paddingTop: Platform.isTV ? 20 : 14 },
  profileAction: { minWidth: Platform.isTV ? 230 : 130, borderRadius: 22, paddingVertical: Platform.isTV ? 18 : 14, paddingHorizontal: Platform.isTV ? 28 : 18, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#DADCE0', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  profileActionPrimary: { backgroundColor: '#111111', borderColor: '#111111' },
  profileActionPressed: { opacity: 0.85 },
  profileActionText: { color: '#111111', fontSize: Platform.isTV ? 22 : 17, fontWeight: '900' },
  profileActionTextPrimary: { color: '#FFFFFF', fontSize: Platform.isTV ? 22 : 17, fontWeight: '900' },
});
