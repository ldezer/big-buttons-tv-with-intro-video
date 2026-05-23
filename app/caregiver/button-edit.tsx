import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { BUTTON_COLORS, ButtonActionType, BigButton } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BUTTON_ART_OPTIONS, cleanImageUri, getBundledButtonArt } from '@/lib/art';

const BUTTON_EMOJIS = [
  '🐕', '🐈', '🐦', '🐟', '🐎', '🐰', '🦁', '🐸',
  '🍕', '🍎', '🍪', '🧃', '🍦', '🥪',
  '🎵', '💃', '🎨', '🏊', '🛝', '🫧',
  '😊', '😢', '😠', '😨', '😴', '🤩',
  '🌳', '🌸', '❄️', '⭐', '🌧️', '🦋',
  '🏠', '🏖️', '📚', '🏫', '🛒', '❤️',
  '▶️', '🖼️', '🔗', '🔀', '🎬', '🎮',
];

const ACTION_TYPES: { type: ButtonActionType; label: string; emoji: string; description: string }[] = [
  { type: 'choice', label: 'Pictures or Videos', emoji: '🔀', description: 'User picks Pictures or Videos' },
  { type: 'google-images', label: 'Google Images', emoji: '🖼️', description: 'Opens image search' },
  { type: 'youtube', label: 'YouTube', emoji: '▶️', description: 'Opens video search' },
  { type: 'url', label: 'Open Website', emoji: '🔗', description: 'Opens a specific URL' },
];

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

export default function ButtonEditScreen() {
  const { profileId, buttonId } = useLocalSearchParams<{ profileId: string; buttonId?: string }>();
  const router = useRouter();
  const { getProfile, addButton, updateButton } = useProfiles();

  const profile = getProfile(profileId);
  const existing = buttonId ? profile?.buttons.find(b => b.id === buttonId) : undefined;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '⭐');
  const [color, setColor] = useState(existing?.color ?? BUTTON_COLORS[0]);
  const [actionType, setActionType] = useState<ButtonActionType>(existing?.action.type ?? 'choice');
  const [query, setQuery] = useState(existing?.action.type !== 'url' ? (existing?.action as any)?.query ?? '' : '');
  const [url, setUrl] = useState(existing?.action.type === 'url' ? existing.action.url : '');
  const [imageUri, setImageUri] = useState(existing?.imageUri ?? '');
  const [bundledArtKey, setBundledArtKey] = useState(existing?.bundledArtKey ?? '');

  const textColor = getTextColor(color);
  const previewSource = useMemo(() => {
    const remote = cleanImageUri(imageUri);
    if (remote) return { uri: remote } as const;
    if (bundledArtKey === 'emoji-only') return null;
    return getBundledButtonArt(bundledArtKey);
  }, [imageUri, bundledArtKey]);

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert('Label required', 'Please enter a label for this button.');
      return;
    }
    if (actionType !== 'url' && !query.trim()) {
      Alert.alert('Search term required', 'Please enter a search term.');
      return;
    }
    if (actionType === 'url' && !url.trim()) {
      Alert.alert('URL required', 'Please enter a URL.');
      return;
    }

    let action: BigButton['action'];
    switch (actionType) {
      case 'google-images': action = { type: 'google-images', query: query.trim() }; break;
      case 'youtube': action = { type: 'youtube', query: query.trim() }; break;
      case 'choice': action = { type: 'choice', query: query.trim() }; break;
      case 'url': action = { type: 'url', url: url.trim() }; break;
    }

    const buttonData = {
      label: label.trim(),
      emoji,
      color,
      imageUri: cleanImageUri(imageUri),
      bundledArtKey,
      action,
      isFavorite: existing?.isFavorite ?? false,
      order: existing?.order ?? (profile?.buttons.length ?? 0),
    };

    if (existing) updateButton(profileId, { ...existing, ...buttonData });
    else addButton(profileId, buttonData);

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={({ pressed, focused }) => [styles.headerBtn, focused && styles.tvFocused, pressed && styles.headerBtnPressed]} onPress={() => router.back()}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{existing ? 'Edit Button' : 'New Button'}</Text>
        <Pressable style={({ pressed, focused }) => [styles.saveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewContainer}>
          {previewSource ? (
            <ImageBackground source={previewSource} imageStyle={styles.previewImage} style={[styles.previewButton, { backgroundColor: '#FFFFFF' }]} resizeMode="cover">
              <View style={styles.previewLabelPill}>
                <Text style={[styles.previewLabel, { color: '#1565C0' }]} numberOfLines={1}>{label || 'Button Label'}</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.previewButton, { backgroundColor: color }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <Text style={[styles.previewLabel, { color: textColor }]} numberOfLines={2}>{label || 'Button Label'}</Text>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Label</Text>
          <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Dogs, Pizza, Music..." placeholderTextColor="#BDBDBD" maxLength={20} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Emoji (replaces button art)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {BUTTON_EMOJIS.map(e => (
              <Pressable key={e} style={({ pressed, focused }) => [styles.emojiOption, focused && styles.tvFocusedSmall, emoji === e && styles.emojiOptionSelected, pressed && styles.emojiOptionPressed]} onPress={() => { setEmoji(e); setBundledArtKey('emoji-only'); setImageUri(''); }}>
                <Text style={styles.emojiOptionText}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Color</Text>
          <View style={styles.colorRow}>
            {BUTTON_COLORS.map(c => (
              <Pressable key={c} style={({ pressed, focused }) => [styles.colorOption, focused && styles.tvFocusedSmall, { backgroundColor: c }, color === c && styles.colorOptionSelected, pressed && styles.colorOptionPressed]} onPress={() => setColor(c)}>
                {color === c && <IconSymbol name="checkmark" size={18} color="#FFFFFF" />}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Remote Art URL (optional)</Text>
          <TextInput style={styles.input} value={imageUri} onChangeText={setImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" />
          <Text style={styles.help}>Paste an image URL and the whole button becomes your art.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bundled Art Slot</Text>
          <View style={styles.optionList}>
            {BUTTON_ART_OPTIONS.map(option => (
              <Pressable key={option.key || 'none'} style={({ pressed, focused }) => [styles.actionTypeOption, focused && styles.tvFocused, bundledArtKey === option.key && styles.actionTypeOptionSelected, pressed && styles.actionTypeOptionPressed]} onPress={() => setBundledArtKey(option.key)}>
                <Text style={styles.actionTypeLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.help}>Replace files in assets/images/custom to make these slots your own art.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>What happens when tapped?</Text>
          <View style={styles.actionTypeList}>
            {ACTION_TYPES.map(at => (
              <Pressable key={at.type} style={({ pressed, focused }) => [styles.actionTypeOption, focused && styles.tvFocused, actionType === at.type && styles.actionTypeOptionSelected, pressed && styles.actionTypeOptionPressed]} onPress={() => setActionType(at.type)}>
                <Text style={styles.actionTypeEmoji}>{at.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTypeLabel}>{at.label}</Text>
                  <Text style={styles.actionTypeDescription}>{at.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {actionType !== 'url' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Search Term</Text>
            <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="dogs, music, trains..." placeholderTextColor="#BDBDBD" />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Website URL</Text>
            <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="https://example.com" autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" />
          </View>
        )}


        <Pressable style={({ pressed, focused }) => [styles.bottomSaveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed]} onPress={handleSave}>
          <Text style={styles.bottomSaveBtnText}>Save Button</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  headerBtnPressed: { backgroundColor: '#F5F5F5' },
  headerBtnText: { fontSize: 16, color: '#757575' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  saveBtn: { backgroundColor: '#1565C0', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 50 },
  saveBtnPressed: { opacity: 0.8 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  tvFocused: { borderWidth: 5, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 16, elevation: 16, transform: [{ scale: 1.03 }] },
  tvFocusedSmall: { borderWidth: 4, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 12, elevation: 14, transform: [{ scale: 1.08 }] },
  bottomSaveBtn: { marginTop: 16, marginBottom: 32, backgroundColor: '#111111', paddingVertical: Platform.isTV ? 24 : 18, borderRadius: 22, alignItems: 'center', borderWidth: 4, borderColor: '#111111' },
  bottomSaveBtnText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  content: { padding: 20, gap: 24, paddingBottom: 48 },
  previewContainer: { alignItems: 'center', paddingVertical: 8 },
  previewButton: { width: 160, height: 160, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  previewImage: { borderRadius: 22 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', padding: 12, backgroundColor: 'transparent' },
  previewLabelPill: { position: 'absolute', left: 10, right: 10, bottom: 10, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 3, borderColor: '#000000', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  previewEmoji: { fontSize: 44, marginBottom: 8, lineHeight: 52 },
  previewLabel: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  field: { gap: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  help: { fontSize: 13, color: '#757575', lineHeight: 18 },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 18, color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  emojiRow: { gap: 8, paddingVertical: 4 },
  emojiOption: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: 'transparent' },
  emojiOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  emojiOptionPressed: { opacity: 0.7 },
  emojiOptionText: { fontSize: 26 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Platform.isTV ? 18 : 12, paddingVertical: 6 },
  colorOption: { width: Platform.isTV ? 70 : 52, height: Platform.isTV ? 70 : 52, borderRadius: Platform.isTV ? 35 : 26, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#111111' },
  colorOptionSelected: { borderColor: '#1A1A1A' },
  colorOptionPressed: { opacity: 0.8 },
  actionTypeList: { gap: 10 },
  optionList: { gap: 10 },
  actionTypeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  actionTypeOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  actionTypeOptionPressed: { opacity: 0.85 },
  actionTypeEmoji: { fontSize: 28 },
  actionTypeLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  actionTypeDescription: { fontSize: 13, color: '#757575', marginTop: 2 },
});
