import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  PressableProps,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';

type TVPressableProps = PressableProps & { children: React.ReactNode; style?: any };
function TVPressable({ children, style, onFocus, onBlur, ...props }: TVPressableProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      focusable
      onFocus={(event) => { setFocused(true); onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); onBlur?.(event); }}
      style={(state) => [typeof style === 'function' ? style({ ...state, focused }) : style, focused && styles.tvFocused, state.pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export default function ChoiceScreen() {
  const { query, label } = useLocalSearchParams<{ query: string; label: string }>();
  const router = useRouter();

  const handlePictures = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${encodeURIComponent(query ?? '')}&tbm=isch&safe=active`);
    router.back();
  };

  const handleVideos = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/results?search_query=${encodeURIComponent(query ?? '')}`);
    router.back();
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.screen}>
        <Image source={require('@/assets/images/custom/big-buttons-logo.jpg')} style={styles.logo} resizeMode="contain" />
        <View style={styles.choiceContainer}>
          <TVPressable hasTVPreferredFocus style={[styles.choiceButton, styles.picturesButton]} onPress={handlePictures} accessibilityRole="button" accessibilityLabel={`See pictures of ${query}`}>
            <Text style={styles.choiceEmoji}>🖼️</Text>
            <Text style={styles.choiceLabel}>Pictures</Text>
          </TVPressable>
          <TVPressable style={[styles.choiceButton, styles.videosButton]} onPress={handleVideos} accessibilityRole="button" accessibilityLabel={`See videos of ${query}`}>
            <Text style={styles.choiceEmoji}>▶️</Text>
            <Text style={styles.choiceLabel}>Videos</Text>
          </TVPressable>
        </View>
        <View style={styles.profilePanel}>
          <TVPressable style={styles.profileAction} onPress={handleBack} accessibilityRole="button" accessibilityLabel="Back">
            <IconSymbol name="arrow.left" size={22} color="#111111" />
            <Text style={styles.profileActionText}>Back</Text>
          </TVPressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: Platform.isTV ? 76 : 24, paddingVertical: Platform.isTV ? 34 : 20, backgroundColor: '#FFFFFF' },
  logo: { alignSelf: 'center', width: Platform.isTV ? 250 : 220, height: Platform.isTV ? 125 : 110, marginBottom: Platform.isTV ? 38 : 24 },
  choiceContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Platform.isTV ? 42 : 18, marginBottom: Platform.isTV ? 44 : 24 },
  choiceButton: { width: Platform.isTV ? 320 : 150, height: Platform.isTV ? 220 : 140, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#DADCE0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  picturesButton: { backgroundColor: '#D32F2F' },
  videosButton: { backgroundColor: '#1565C0' },
  choiceEmoji: { fontSize: Platform.isTV ? 76 : 48, marginBottom: 14, lineHeight: Platform.isTV ? 84 : 56 },
  choiceLabel: { fontSize: Platform.isTV ? 34 : 22, fontWeight: '900', color: '#FFFFFF' },
  profilePanel: { alignItems: 'center' },
  profileAction: { minWidth: Platform.isTV ? 230 : 140, borderRadius: 24, paddingVertical: Platform.isTV ? 20 : 14, paddingHorizontal: Platform.isTV ? 24 : 18, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: '#DADCE0', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  profileActionText: { color: '#111111', fontSize: Platform.isTV ? 22 : 17, fontWeight: '900' },
  tvFocused: { borderWidth: 8, borderColor: '#000000', transform: [{ scale: 1.06 }], shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.95, shadowRadius: 22, elevation: 30, zIndex: 50 },
  pressed: { opacity: 0.86 },
});
