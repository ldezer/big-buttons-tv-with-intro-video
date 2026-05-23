import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Platform, Alert, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { BUTTON_COLORS, ButtonActionType, BigButton } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BUTTON_ART_OPTIONS, cleanImageUri, getBundledButtonArt } from '@/lib/art';
import { TVPressable, tvFocusStyles } from '@/components/tv/tv-pressable';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const textColor = getTextColor(color);
  const previewSource = useMemo(() => {
    const remote = cleanImageUri(imageUri);
    if (remote) return { uri: remote } as const;
    if (bundledArtKey === 'emoji-only') return null;
    return getBundledButtonArt(bundledArtKey);
  }, [imageUri, bundledArtKey]);

  const initialSnapshot = JSON.stringify({
    label: existing?.label ?? '',
    emoji: existing?.emoji ?? '⭐',
    color: existing?.color ?? BUTTON_COLORS[0],
    actionType: existing?.action.type ?? 'choice',
    query: existing?.action.type !== 'url' ? (existing?.action as any)?.query ?? '' : '',
    url: existing?.action.type === 'url' ? existing.action.url : '',
    imageUri: existing?.imageUri ?? '',
    bundledArtKey: existing?.bundledArtKey ?? '',
  });
  const currentSnapshot = JSON.stringify({ label, emoji, color, actionType, query, url, imageUri, bundledArtKey });
  const hasChanges = currentSnapshot !== initialSnapshot;
  const hasRequiredAction = actionType === 'url' ? url.trim().length > 0 : query.trim().length > 0;
  const canSave = label.trim().length > 0 && hasRequiredAction && hasChanges;

  const handleSave = () => {
    if (!label.trim()) return Alert.alert('Label required', 'Please enter a label for this button.');
    if (actionType !== 'url' && !query.trim()) return Alert.alert('Search term required', 'Please enter a search term.');
    if (actionType === 'url' && !url.trim()) return Alert.alert('URL required', 'Please enter a URL.');
    if (!hasChanges) return;

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
    Alert.alert('Saved', 'Button saved.', [{ text: 'Done', onPress: () => router.back() }]);
  };

  const SaveButton = ({ bottom = false }: { bottom?: boolean }) => (
    <TVPressable
      style={({ pressed, focused }: any) => [bottom ? styles.bottomSaveBtn : styles.saveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed, !canSave && styles.saveDisabled]}
      disabled={!canSave}
      onPress={handleSave}
      accessibilityRole="button"
      accessibilityLabel="Save Button"
    >
      <IconSymbol name="checkmark" size={bottom ? 26 : 20} color="#FFFFFF" />
      <Text style={bottom ? styles.bottomSaveBtnText : styles.saveBtnText}>Save Button</Text>
    </TVPressable>
  );

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TVPressable style={({ pressed, focused }: any) => [styles.headerBtn, focused && styles.tvFocused, pressed && styles.headerBtnPressed]} onPress={() => router.back()} hasTVPreferredFocus>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TVPressable>
        <Text style={styles.headerTitle}>{existing ? 'Edit Button' : 'New Button'}</Text>
        <SaveButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
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
          <TextInput style={[styles.input, focusedInput === 'label' && styles.inputFocused]} value={label} onChangeText={setLabel} placeholder="Dogs, Pizza, Music..." placeholderTextColor="#BDBDBD" maxLength={20} onFocus={() => setFocusedInput('label')} onBlur={() => setFocusedInput(null)} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Emoji (replaces button art)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {BUTTON_EMOJIS.map(e => (
              <TVPressable key={e} style={({ pressed, focused }: any) => [styles.emojiOption, focused && styles.tvFocusedSmall, emoji === e && styles.emojiOptionSelected, pressed && styles.emojiOptionPressed]} onPress={() => { setEmoji(e); setBundledArtKey('emoji-only'); setImageUri(''); }}>
                <Text style={styles.emojiOptionText}>{e}</Text>
              </TVPressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Button Color</Text>
          <View style={styles.colorRow}>
            {BUTTON_COLORS.map(c => (
              <TVPressable key={c} style={({ pressed, focused }: any) => [styles.colorOption, focused && styles.tvFocusedSmall, { backgroundColor: c }, color === c && styles.colorOptionSelected, pressed && styles.colorOptionPressed]} onPress={() => setColor(c)}>
                {color === c && <IconSymbol name="checkmark" size={24} color="#FFFFFF" />}
              </TVPressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Remote Art URL (optional)</Text>
          <TextInput style={[styles.input, focusedInput === 'imageUrl' && styles.inputFocused]} value={imageUri} onChangeText={(v) => { setImageUri(v); if (v.trim()) setBundledArtKey(''); }} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('imageUrl')} onBlur={() => setFocusedInput(null)} />
          <Text style={styles.help}>Paste an image URL and the whole button becomes your art.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bundled Art Slot</Text>
          <View style={styles.optionList}>
            {BUTTON_ART_OPTIONS.map(option => (
              <TVPressable key={option.key || 'none'} style={({ pressed, focused }: any) => [styles.actionTypeOption, focused && styles.tvFocused, bundledArtKey === option.key && styles.actionTypeOptionSelected, pressed && styles.actionTypeOptionPressed]} onPress={() => { setBundledArtKey(option.key); setImageUri(''); }}>
                <Text style={styles.actionTypeLabel}>{option.label}</Text>
              </TVPressable>
            ))}
          </View>
          <Text style={styles.help}>Replace files in assets/images/custom to make these slots your own art.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>What happens when tapped?</Text>
          <View style={styles.actionTypeList}>
            {ACTION_TYPES.map(at => (
              <TVPressable key={at.type} style={({ pressed, focused }: any) => [styles.actionTypeOption, focused && styles.tvFocused, actionType === at.type && styles.actionTypeOptionSelected, pressed && styles.actionTypeOptionPressed]} onPress={() => setActionType(at.type)}>
                <Text style={styles.actionTypeEmoji}>{at.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTypeLabel}>{at.label}</Text>
                  <Text style={styles.actionTypeDescription}>{at.description}</Text>
                </View>
              </TVPressable>
            ))}
          </View>
        </View>

        {actionType !== 'url' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Search Term</Text>
            <TextInput style={[styles.input, focusedInput === 'query' && styles.inputFocused]} value={query} onChangeText={setQuery} placeholder="dogs, music, trains..." placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('query')} onBlur={() => setFocusedInput(null)} />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Website URL</Text>
            <TextInput style={[styles.input, focusedInput === 'url' && styles.inputFocused]} value={url} onChangeText={setUrl} placeholder="https://example.com" autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('url')} onBlur={() => setFocusedInput(null)} />
          </View>
        )}

        <SaveButton bottom />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Platform.isTV ? 36 : 16, paddingVertical: Platform.isTV ? 18 : 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerBtn: { minWidth: Platform.isTV ? 190 : 90, paddingVertical: Platform.isTV ? 18 : 10, paddingHorizontal: 18, borderRadius: 18, borderWidth: 3, borderColor: '#DADCE0', backgroundColor: '#FFFFFF', alignItems: 'center' },
  headerBtnPressed: { backgroundColor: '#F5F5F5' }, headerBtnText: { fontSize: Platform.isTV ? 22 : 16, color: '#333333', fontWeight: '800' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: Platform.isTV ? 28 : 18, fontWeight: '900', color: '#1A1A1A' },
  saveBtn: { minWidth: Platform.isTV ? 230 : 120, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111', paddingVertical: Platform.isTV ? 18 : 10, paddingHorizontal: 22, borderRadius: 18, borderWidth: 4, borderColor: '#111111' },
  saveBtnPressed: { opacity: 0.8 }, saveBtnText: { fontSize: Platform.isTV ? 22 : 16, fontWeight: '900', color: '#FFFFFF' }, saveDisabled: { backgroundColor: '#999999', borderColor: '#999999', opacity: 0.45 },
  tvFocused: { ...tvFocusStyles.focused }, tvFocusedSmall: { ...tvFocusStyles.focusedSmall },
  bottomSaveBtn: { marginTop: 18, marginBottom: 42, backgroundColor: '#111111', paddingVertical: Platform.isTV ? 28 : 18, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#111111', flexDirection: 'row', gap: 12 },
  bottomSaveBtnText: { color: '#FFFFFF', fontSize: Platform.isTV ? 28 : 22, fontWeight: '900' },
  content: { padding: Platform.isTV ? 34 : 20, gap: Platform.isTV ? 28 : 24, paddingBottom: 56 },
  previewContainer: { alignItems: 'center', paddingVertical: 8 },
  previewButton: { width: Platform.isTV ? 190 : 160, height: Platform.isTV ? 190 : 160, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  previewImage: { borderRadius: 24 }, previewLabelPill: { position: 'absolute', left: 10, right: 10, bottom: 10, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 3, borderColor: '#000000', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  previewEmoji: { fontSize: Platform.isTV ? 58 : 44, marginBottom: 8, lineHeight: Platform.isTV ? 68 : 52 }, previewLabel: { fontSize: Platform.isTV ? 22 : 18, fontWeight: '800', textAlign: 'center', lineHeight: Platform.isTV ? 27 : 22 },
  field: { gap: 12 }, label: { fontSize: Platform.isTV ? 22 : 16, fontWeight: '800', color: '#1A1A1A' }, help: { fontSize: Platform.isTV ? 16 : 13, color: '#757575', lineHeight: 20 }, input: { borderWidth: 3, borderColor: '#DADCE0', borderRadius: 16, padding: Platform.isTV ? 20 : 14, fontSize: Platform.isTV ? 24 : 18, color: '#1A1A1A', backgroundColor: '#FAFAFA' }, inputFocused: { borderWidth: 7, borderColor: '#000000', backgroundColor: '#FFFFFF' },
  emojiRow: { gap: 12, paddingVertical: 8 }, emojiOption: { width: Platform.isTV ? 70 : 52, height: Platform.isTV ? 70 : 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderWidth: 3, borderColor: '#DADCE0' }, emojiOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, emojiOptionPressed: { opacity: 0.7 }, emojiOptionText: { fontSize: Platform.isTV ? 36 : 26 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Platform.isTV ? 20 : 12, paddingVertical: 8 }, colorOption: { width: Platform.isTV ? 82 : 52, height: Platform.isTV ? 82 : 52, borderRadius: Platform.isTV ? 41 : 26, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#DADCE0' }, colorOptionSelected: { borderColor: '#000000' }, colorOptionPressed: { opacity: 0.8 },
  actionTypeList: { gap: 12 }, optionList: { gap: 12 }, actionTypeOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Platform.isTV ? 18 : 14, borderRadius: 18, borderWidth: 3, borderColor: '#DADCE0', backgroundColor: '#FFFFFF' }, actionTypeOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, actionTypeOptionPressed: { opacity: 0.85 }, actionTypeEmoji: { fontSize: Platform.isTV ? 34 : 28 }, actionTypeLabel: { fontSize: Platform.isTV ? 22 : 16, fontWeight: '800', color: '#1A1A1A' }, actionTypeDescription: { fontSize: Platform.isTV ? 16 : 13, color: '#757575', marginTop: 2 },
});
