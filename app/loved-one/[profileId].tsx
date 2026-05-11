import React, { useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Platform, Dimensions, ActivityIndicator, ImageBackground,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
function getButtonSize(columns: number): number { const padding = 24 * 2; const gap = 12 * (columns - 1); return (SCREEN_WIDTH - padding - gap) / columns; }
function getTextColor(bgColor: string): string { const hex = bgColor.replace('#', ''); const r = parseInt(hex.slice(0, 2), 16); const g = parseInt(hex.slice(2, 4), 16); const b = parseInt(hex.slice(4, 6), 16); const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255; return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF'; }

export default function LovedOneMode() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const { getProfile } = useProfiles();
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
  const buttonSize = getButtonSize(columns);
  const fontSize = FONT_SIZE_MAP[profile.settings.fontSize];
  const sortedButtons = [...profile.buttons].sort((a, b) => a.order - b.order);
  const bannerSource = cleanImageUri(profile.bannerImageUri) ? { uri: cleanImageUri(profile.bannerImageUri) } : getBundledProfileArt(profile.bannerBundledArtKey);
  const avatarSource = cleanImageUri(profile.avatarImageUri) ? { uri: cleanImageUri(profile.avatarImageUri) } : getBundledProfileArt(profile.avatarBundledArtKey);
  const backgroundSource = cleanImageUri(profile.backgroundImageUri) ? { uri: cleanImageUri(profile.backgroundImageUri) } : null;

  const content = (
    <>
      <View style={styles.topBar}>
        <Pressable hasTVPreferredFocus
          style={({ pressed, focused }) => [styles.homeButton, focused && styles.tvFocused, pressed && styles.homeButtonPressed]} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
          <Text style={styles.homeButtonText}>Home</Text>
        </Pressable>
        <Text style={[styles.profileName, { color: profile.color }]}>{profile.emoji} {profile.name}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      {bannerSource ? (
        <ImageBackground source={bannerSource} style={styles.banner} imageStyle={styles.bannerImage}>
          <View style={styles.bannerShade}>
            <View style={styles.bannerHeaderRow}>
              {avatarSource ? <ImageBackground source={avatarSource} style={styles.avatarImage} imageStyle={styles.avatarImageInner} /> : <View style={[styles.avatarFallback, { backgroundColor: profile.color }]}><Text style={styles.avatarFallbackEmoji}>{profile.emoji}</Text></View>}
              <View style={styles.bannerTextWrap}>
                <Text style={styles.bannerTitle}>{profile.name}'s page</Text>
                <Text style={styles.bannerSubtitle}>Tap a big button</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.bannerPlain}>
          {avatarSource ? <ImageBackground source={avatarSource} style={styles.avatarImage} imageStyle={styles.avatarImageInner} /> : <View style={[styles.avatarFallback, { backgroundColor: profile.color }]}><Text style={styles.avatarFallbackEmoji}>{profile.emoji}</Text></View>}
          <View style={styles.bannerTextWrap}><Text style={[styles.bannerTitlePlain, { color: profile.color }]}>{profile.name}'s page</Text><Text style={styles.bannerSubtitlePlain}>Tap a big button</Text></View>
        </View>
      )}

      {sortedButtons.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🔧</Text><Text style={styles.emptyTitle}>No buttons yet</Text><Text style={styles.emptyText}>Ask your caregiver to add some buttons for you!</Text></View> : (
        <ScrollView contentContainerStyle={[styles.grid, { padding: 24, gap: 12 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.gridRow, { flexWrap: 'wrap', gap: 12 }]}> 
            {sortedButtons.map(button => {
              const remote = cleanImageUri(button.imageUri);
              const artSource = remote ? { uri: remote } : getBundledButtonArt(button.bundledArtKey);
              const textColor = artSource ? '#FFFFFF' : getTextColor(button.color);
              return (
                <Pressable key={button.id} style={({ pressed, focused }) => [styles.buttonWrap, { width: buttonSize, height: buttonSize }, focused && styles.tvFocused, pressed && styles.bigButtonPressed]} onPress={() => handleButtonPress(button)} accessibilityLabel={button.label}>
                  {artSource ? (
                    <ImageBackground source={artSource} style={[styles.bigButton, { backgroundColor: button.color, width: buttonSize, height: buttonSize }]} imageStyle={styles.bigButtonImage}>
                      <View style={styles.imageButtonShade}><Text style={styles.buttonEmoji}>{button.emoji}</Text><Text style={[styles.buttonLabel, { color: textColor, fontSize }]} numberOfLines={2} adjustsFontSizeToFit>{button.label}</Text></View>
                    </ImageBackground>
                  ) : (
                    <View style={[styles.bigButton, { backgroundColor: button.color, width: buttonSize, height: buttonSize }]}><Text style={styles.buttonEmoji}>{button.emoji}</Text><Text style={[styles.buttonLabel, { color: textColor, fontSize }]} numberOfLines={2} adjustsFontSizeToFit>{button.label}</Text></View>
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  homeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 50, borderWidth: 2, borderColor: '#1565C0', backgroundColor: '#FFFFFF' },
  homeButtonPressed: { backgroundColor: '#E3F2FD' },
  tvFocused: { borderWidth: 4, borderColor: '#FFD54F', transform: [{ scale: 1.03 }] },
  homeButtonText: { fontSize: 15, fontWeight: '600', color: '#1565C0' },
  profileName: { fontSize: 18, fontWeight: '700' },
  topBarSpacer: { width: 90 },
  banner: { marginHorizontal: 16, marginTop: 16, borderRadius: 24, overflow: 'hidden', minHeight: 132 },
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
  imageButtonShade: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.24)' },
  bigButtonPressed: { transform: [{ scale: 0.95 }], opacity: 0.9 },
  buttonEmoji: { fontSize: 44, marginBottom: 8, lineHeight: 52 },
  buttonLabel: { fontWeight: '700', textAlign: 'center', lineHeight: 34, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#757575', textAlign: 'center', lineHeight: 24 },
});
