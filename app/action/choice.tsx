import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ChoiceScreen() {
  const { query, label } = useLocalSearchParams<{ query: string; label: string }>();
  const router = useRouter();

  const handlePictures = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = `https://www.google.com/search?q=${encodeURIComponent(query ?? '')}&tbm=isch&safe=active`;
    await WebBrowser.openBrowserAsync(url);
    router.back();
  };

  const handleVideos = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query ?? '')}`;
    await WebBrowser.openBrowserAsync(url);
    router.back();
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <ScreenContainer
      containerClassName="bg-white"
      edges={['top', 'left', 'right', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed, focused }) => [styles.backButton, focused && styles.tvFocused, pressed && styles.backButtonPressed]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="xmark" size={22} color="#757575" />
        </Pressable>
        <Text style={styles.headerTitle}>{label ?? query}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>What do you want to see?</Text>
      </View>

      {/* Choice Buttons */}
      <View style={styles.choiceContainer}>
        {/* Pictures */}
        <Pressable
          hasTVPreferredFocus
          style={({ pressed, focused }) => [
            styles.choiceButton,
            styles.picturesButton,
            focused && styles.tvFocused,
            pressed && styles.choiceButtonPressed,
          ]}
          onPress={handlePictures}
          accessibilityRole="button"
          accessibilityLabel={`See pictures of ${query}`}
        >
          <Text style={styles.choiceEmoji}>🖼️</Text>
          <Text style={styles.choiceLabel}>Pictures</Text>
        </Pressable>

        {/* Videos */}
        <Pressable
          style={({ pressed, focused }) => [
            styles.choiceButton,
            styles.videosButton,
            focused && styles.tvFocused,
            pressed && styles.choiceButtonPressed,
          ]}
          onPress={handleVideos}
          accessibilityRole="button"
          accessibilityLabel={`See videos of ${query}`}
        >
          <Text style={styles.choiceEmoji}>▶️</Text>
          <Text style={styles.choiceLabel}>Videos</Text>
        </Pressable>
      </View>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  backButtonPressed: {
    backgroundColor: '#E0E0E0',
  },
  tvFocused: {
    borderWidth: 4,
    borderColor: '#FFD54F',
    transform: [{ scale: 1.03 }],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  questionContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
  },
  choiceContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  choiceButton: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  picturesButton: {
    backgroundColor: '#D32F2F',
  },
  videosButton: {
    backgroundColor: '#1565C0',
  },
  choiceButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  choiceEmoji: {
    fontSize: 64,
    marginBottom: 16,
    lineHeight: 72,
  },
  choiceLabel: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
