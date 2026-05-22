import React, { useCallback, useMemo, useState } from 'react';
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
  const horizontalPadding = Platform.isTV ? 72 * 2 : 24 * 2;
  const gap = (Platform.isTV ? 22 : 12) * (columns - 1);
  const widthSize = (screenWidth - horizontalPadding - gap) / columns;
  const heightSize = Platform.isTV ? (screenHeight - 300) / 2 : widthSize;
  return Math.max(150, Math.min(widthSize, heightSize, Platform.isTV ? 380 : widthSize));
}
function getTextColor(bgColor: string): string { const hex = bgColor.replace('#', ''); const r = parseInt(hex.slice(0, 2), 16); const g = parseInt(hex.slice(2, 4), 16); const b = parseInt(hex.slice(4, 6), 16); const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255; return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF'; }

export default function LovedOneMode() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const { getProfile } = useProfiles();
  const { width, height } = useWindowDimensions();
  const [selectedLabel, setSelectedLabel] = useState('Use the remote arrows. Press OK to choose.');
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

  if (!profile) return <ScreenContainer containerClassName="bg-white"><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1565C0" /></View></ScreenContainer>;

  const columns = profile.settings.columns;
  const buttonSize = getButtonSize(columns, width, height);
  const fontSize = FONT_SIZE_MAP[profile.settings.fontSize];
  const sortedButtons = [...profile.buttons].sort((a, b) => a.order - b.order);
  const bannerSource = cleanImageUri(profile.bannerImageUri) ? { uri: cleanImageUri(profile.bannerImageUri) } : getBundledProfileArt(profile.bannerBundledArtKey);
  const avatarSource = cleanImageUri(profile.avatarImageUri) ? { uri: cleanImageUri(profile.avatarImageUri) } : getBundledProfileArt(profile.avatarBundledArtKey);
  const backgroundSource = cleanImageUri(profile.backgroundImageUri) ? { uri: cleanImageUri(profile.backgroundImageUri) } : null;

  const content = (
    <>
      <View style={styles.topBar}>
        <Pressable hasTVPreferredFocus
          style={({ pressed, focused }) => [styles.topButton, focused && styles.tvFocused, pressed && styles.topButtonPressed]}
          onFocus={() => setSelectedLabel('Back')}
          onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
          <Text style={styles.topButtonText}>Back</Text>
        </Pressable>
        <Text style={[styles.profileName, { color: profile.color }]}>{profile.name}</Text>
        <Pressable
          style={({ pressed, focused }) => [styles.editButton, focused && styles.tvFocused, pressed && styles.editButtonPressed]}
          onFocus={() => setSelectedLabel('Edit Profiles')}
          onPress={() => router.push('/caregiver')}>
          <Text style={styles.editButtonText}>Edit Profiles</Text>
        </Pressable>
      </View>

      {bannerSource ? (
        <ImageBackground source={bannerSource} style={styles.banner} imageStyle={styles.bannerImage} resizeMode="contain" />
      ) : (
        <View style={styles.bannerPlain}>
          {avatarSource ? <ImageBackground source={avatarSource} style={styles.avatarImage} imageStyle={styles.avatarImageInner} /> : <View style={[styles.avatarFallback, { backgroundColor: profile.color }]}><Text style={styles.avatarFallbackEmoji}>{profile.emoji}</Text></View>}
          <View style={styles.bannerTextWrap}><Text style={[styles.bannerTitlePlain, { color: profile.color }]}>{profile.name}'s page</Text><Text style={styles.bannerSubtitlePlain}>Tap a big button</Text></View>
        </View>
      )}

      {sortedButtons.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔧</Text><Text style={styles.emptyTitle}>No buttons yet</Text><Text style={styles.emptyText}>Ask your caregiver to add some buttons for you!</Text></View> : (
        <ScrollView contentContainerStyle={[styles.grid, { paddingHorizontal: Platform.isTV ? 72 : 24, paddingTop: Platform.isTV ? 18 : 24, paddingBottom: Platform.isTV ? 36 : 24, gap: Platform.isTV ? 22 : 12 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.gridRow, { flexWrap: 'wrap', gap: Platform.isTV ? 22 : 12 }]}> 
            {sortedButtons.map(button => {
              const remote = cleanImageUri(button.imageUri);
              const artSource = remote ? { uri: remote } : getBundledButtonArt(button.bundledArtKey);
              const textColor = artSource ? '#FFFFFF' : getTextColor(button.color);
              return (
                <Pressable key={button.id} style={({ pressed, focused }) => [styles.buttonWrap, { width: buttonSize, height: buttonSize }, focused && styles.tvFocused, pressed && styles.bigButtonPressed]} onFocus={() => setSelectedLabel(button.label)} onPress={() => handleButtonPress(button)} accessibilityLabel={button.label}>
                  {artSource ? (
                    <ImageBackground source={artSource} style={[styles.bigButton, { backgroundColor: '#FFFFFF', width: buttonSize, height: buttonSize }]} imageStyle={styles.bigButtonImage} resizeMode="cover">
                      <View style={styles.imageButtonLabelPill}><Text style={[styles.buttonLabel, { color: '#1565C0', fontSize: Math.max(20, fontSize - 4) }]} numberOfLines={1} adjustsFontSizeToFit>{button.label}</Text></View>
                    </ImageBackground>
                  ) : (
                    <View style={[styles.bigButton, { backgroundColor: button.color, width: buttonSize, height: buttonSize }]}>{button.emoji ? <Text style={styles.buttonEmoji}>{button.emoji}</Text> : null}<Text style={[styles.buttonLabel, { color: textColor, fontSize }]} numberOfLines={2} adjustsFontSizeToFit>{button.label}</Text></View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </>
  );

  return <ScreenContainer containerClassName="bg-white" edges={['top','left','right','bottom']}>{backgroundSource ? <ImageBackground source={backgroundSource} style={styles.fullBg} imageStyle={styles.fullBgImage}>{content}</ImageBackground> : content}</ScreenContainer>;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fullBg: { flex: 1 },
  fullBgImage: { opacity: 0.12 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Platform.isTV ? 36 : 16, paddingVertical: Platform.isTV ? 10 : 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  topButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 50, borderWidth: 2, borderColor: '#1565C0', backgroundColor: '#FFFFFF' },
  topButtonPressed: { backgroundColor: '#E3F2FD' },
  editButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 50, backgroundColor: '#1565C0', borderWidth: 2, borderColor: '#1565C0' },
  editButtonPressed: { opacity: 0.85 },
  tvFocused: { borderWidth: 6, borderColor: '#E53935', transform: [{ scale: 1.04 }], shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18, elevation: 16 },
  topButtonText: { fontSize: 15, fontWeight: '600', color: '#1565C0' },
  editButtonText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  profileName: { fontSize: 18, fontWeight: '700' },
  banner: { marginHorizontal: Platform.isTV ? 64 : 16, marginTop: Platform.isTV ? 14 : 16, borderRadius: 24, overflow: 'hidden', height: Platform.isTV ? 138 : 132, backgroundColor: '#FFFFFF' },
  bannerImage: { borderRadius: 24 },
  bannerShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', padding: 18, justifyContent: 'flex-end' },
  bannerHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  bannerSubtitle: { fontSize: 16, color: '#F4F7FB', marginTop: 4 },
  bannerPlain: { marginHorizontal: 16, marginTop: 16, borderRadius: 24, backgroundColor: '#F4F7FB', padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerTitlePlain: { fontSize: 28, fontWeight: '800' },
  bannerSubtitlePlain: { fontSize: 16, color: '#757575', marginTop: 4 },
  avatarImage: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden' },
  avatarImageInner: { borderRadius: 20 },
  avatarFallback: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackEmoji: { fontSize: 32 },
  grid: { flexGrow: 1 },
  gridRow: { flexDirection: 'row' },
  buttonWrap: { borderRadius: 20, overflow: 'hidden' },
  bigButton: { borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  bigButtonImage: { borderRadius: 20 },
  imageButtonShade: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: 'transparent' },
  imageButtonLabelPill: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 3, borderColor: '#E53935', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  bigButtonPressed: { transform: [{ scale: 0.95 }], opacity: 0.9 },
  buttonEmoji: { fontSize: 44, marginBottom: 8, lineHeight: 52 },
  buttonLabel: { fontWeight: '700', textAlign: 'center', lineHeight: 34, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', lineHeight: 24 },
  selectionBar: { position: 'absolute', left: 20, right: 20, bottom: 18, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#E53935', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 },
  selectionText: { fontSize: Platform.isTV ? 26 : 18, fontWeight: '900', color: '#1565C0', textAlign: 'center' },
});
