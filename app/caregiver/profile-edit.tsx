import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Platform, Alert, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { useApp } from '@/lib/app-context';
import { PROFILE_COLORS, ProfileSettings, FontSize, ColumnCount } from '@/lib/types';
import { TVPressable, tvFocusStyles } from '@/components/tv/tv-pressable';
import { StickySaveBar } from '@/components/tv/sticky-save-bar';
import { useMenuKey } from '@/lib/tv-focus/focus-manager';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PROFILE_AVATAR_OPTIONS, PROFILE_BANNER_OPTIONS, cleanImageUri, getBundledProfileArt } from '@/lib/art';

const PROFILE_EMOJIS = ['😊','🧒','👦','👧','🧑','👨','👩','🧓','👴','👵','🐶','🐱','🦊','🐻','🐼','🦁','🐸','🐧','🦋','⭐'];

export default function ProfileEditScreen() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const router = useRouter();
  const { getProfile, addProfile, updateProfile, deleteProfile } = useProfiles();
  const { settings: appSettings } = useApp();
  const existing = profileId ? getProfile(profileId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '😊');
  const [color, setColor] = useState(existing?.color ?? PROFILE_COLORS[0]);
  const [spokenLabels, setSpokenLabels] = useState(existing?.settings.spokenLabels ?? appSettings.defaultSpokenLabels);
  const [fontSize, setFontSize] = useState<FontSize>(existing?.settings.fontSize ?? appSettings.defaultFontSize);
  const [columns, setColumns] = useState<ColumnCount>(existing?.settings.columns ?? appSettings.defaultColumns);
  const [avatarImageUri, setAvatarImageUri] = useState(existing?.avatarImageUri ?? '');
  const [avatarBundledArtKey, setAvatarBundledArtKey] = useState(existing?.avatarBundledArtKey ?? '');
  const [bannerImageUri, setBannerImageUri] = useState(existing?.bannerImageUri ?? '');
  const [bannerBundledArtKey, setBannerBundledArtKey] = useState(existing?.bannerBundledArtKey ?? '');
  const [backgroundImageUri, setBackgroundImageUri] = useState(existing?.backgroundImageUri ?? '');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const avatarSource = useMemo(() => cleanImageUri(avatarImageUri) ? { uri: cleanImageUri(avatarImageUri) } : getBundledProfileArt(avatarBundledArtKey), [avatarImageUri, avatarBundledArtKey]);
  const bannerSource = useMemo(() => cleanImageUri(bannerImageUri) ? { uri: cleanImageUri(bannerImageUri) } : getBundledProfileArt(bannerBundledArtKey), [bannerImageUri, bannerBundledArtKey]);

  const initialSnapshot = JSON.stringify({
    name: existing?.name ?? '',
    emoji: existing?.emoji ?? '😊',
    color: existing?.color ?? PROFILE_COLORS[0],
    spokenLabels: existing?.settings.spokenLabels ?? appSettings.defaultSpokenLabels,
    fontSize: existing?.settings.fontSize ?? appSettings.defaultFontSize,
    columns: existing?.settings.columns ?? appSettings.defaultColumns,
    avatarImageUri: existing?.avatarImageUri ?? '',
    avatarBundledArtKey: existing?.avatarBundledArtKey ?? '',
    bannerImageUri: existing?.bannerImageUri ?? '',
    bannerBundledArtKey: existing?.bannerBundledArtKey ?? '',
    backgroundImageUri: existing?.backgroundImageUri ?? '',
  });
  const currentSnapshot = JSON.stringify({ name, emoji, color, spokenLabels, fontSize, columns, avatarImageUri, avatarBundledArtKey, bannerImageUri, bannerBundledArtKey, backgroundImageUri });
  const hasChanges = currentSnapshot !== initialSnapshot;
  const canSave = name.trim().length > 0 && hasChanges;

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter a name for this profile.');
    if (!hasChanges) return;
    const profileSettings: ProfileSettings = { spokenLabels, fontSize, columns };
    if (existing) {
      updateProfile({ ...existing, name: name.trim(), emoji, color, settings: profileSettings, avatarImageUri: cleanImageUri(avatarImageUri), avatarBundledArtKey, bannerImageUri: cleanImageUri(bannerImageUri), bannerBundledArtKey, backgroundImageUri: cleanImageUri(backgroundImageUri) });
    } else {
      const profile = addProfile(name.trim(), emoji, color, profileSettings);
      updateProfile({ ...profile, avatarImageUri: cleanImageUri(avatarImageUri), avatarBundledArtKey, bannerImageUri: cleanImageUri(bannerImageUri), bannerBundledArtKey, backgroundImageUri: cleanImageUri(backgroundImageUri) });
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Profile changes saved.', [{ text: 'Done', onPress: () => router.back() }]);
  };

  const handleDelete = () => Alert.alert('Delete Profile', `Are you sure you want to delete "${existing?.name}"? All buttons will be removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteProfile(profileId!); router.back(); } }]);

  // Hardware MENU button on Android TV / Fire TV remotes saves directly.
  useMenuKey(() => { if (canSave) handleSave(); });

  const SaveButton = ({ bottom = false }: { bottom?: boolean }) => (
    <TVPressable
      style={({ pressed, focused }: any) => [bottom ? styles.bottomSaveBtn : styles.saveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed, !canSave && styles.saveDisabled]}
      disabled={!canSave}
      onPress={handleSave}
      accessibilityRole="button"
      accessibilityLabel="Save Profile"
    >
      <IconSymbol name="checkmark" size={bottom ? 26 : 20} color="#FFFFFF" />
      <Text style={bottom ? styles.bottomSaveBtnText : styles.saveBtnText}>Save Profile</Text>
    </TVPressable>
  );

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top','left','right','bottom']}>
      <View style={styles.header}>
        <TVPressable style={({ pressed, focused }: any) => [styles.headerBtn, focused && styles.tvFocused, pressed && styles.headerBtnPressed]} onPress={() => router.back()} hasTVPreferredFocus>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TVPressable>
        <Text style={styles.headerTitle}>{existing ? 'Edit Profile' : 'New Profile'}</Text>
        <SaveButton />
      </View>

      <ScrollView contentContainerStyle={[styles.content, styles.contentWithStickyBar]} showsVerticalScrollIndicator>
        <View style={styles.previewContainer}>
          {bannerSource ? <ImageBackground source={bannerSource} style={styles.previewBanner} imageStyle={styles.previewBannerImage}><View style={styles.previewShade}>{avatarSource ? <ImageBackground source={avatarSource} style={styles.previewAvatar} imageStyle={styles.previewAvatarInner} /> : <View style={[styles.previewAvatarFallback, { backgroundColor: color }]}><Text style={styles.previewEmoji}>{emoji}</Text></View>}<Text style={styles.previewNameBanner}>{name || 'Name'}</Text></View></ImageBackground> : <View style={styles.previewRow}>{avatarSource ? <ImageBackground source={avatarSource} style={styles.previewAvatar} imageStyle={styles.previewAvatarInner} /> : <View style={[styles.previewAvatarFallback, { backgroundColor: color }]}><Text style={styles.previewEmoji}>{emoji}</Text></View>}<Text style={[styles.previewName, { color }]}>{name || 'Name'}</Text></View>}
        </View>

        <View style={styles.field}><Text style={styles.label}>Name</Text><TextInput style={[styles.input, focusedInput === 'name' && styles.inputFocused]} value={name} onChangeText={setName} placeholder="Enter name..." placeholderTextColor="#BDBDBD" maxLength={30} onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)} /></View>

        <View style={styles.field}><Text style={styles.label}>Avatar Emoji</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>{PROFILE_EMOJIS.map(e => <TVPressable key={e} style={({ pressed, focused }: any) => [styles.emojiOption, focused && styles.tvFocusedSmall, emoji === e && styles.emojiOptionSelected, pressed && styles.emojiOptionPressed]} onPress={() => setEmoji(e)}><Text style={styles.emojiOptionText}>{e}</Text></TVPressable>)}</ScrollView></View>

        <View style={styles.field}><Text style={styles.label}>Profile Color</Text><View style={styles.colorRow}>{PROFILE_COLORS.map(c => <TVPressable key={c} style={({ pressed, focused }: any) => [styles.colorOption, focused && styles.tvFocusedSmall, { backgroundColor: c }, color === c && styles.colorOptionSelected, pressed && styles.colorOptionPressed]} onPress={() => setColor(c)}>{color === c && <IconSymbol name="checkmark" size={24} color="#FFFFFF" />}</TVPressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Avatar Image URL (optional)</Text><TextInput style={[styles.input, focusedInput === 'avatarUrl' && styles.inputFocused]} value={avatarImageUri} onChangeText={setAvatarImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('avatarUrl')} onBlur={() => setFocusedInput(null)} /></View>
        <View style={styles.field}><Text style={styles.label}>Bundled Avatar Slot</Text><View style={styles.segmentWrap}>{PROFILE_AVATAR_OPTIONS.map(option => <TVPressable key={option.key || 'none'} style={({ pressed, focused }: any) => [styles.segment, focused && styles.tvFocused, avatarBundledArtKey === option.key && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setAvatarBundledArtKey(option.key)}><Text style={[styles.segmentText, avatarBundledArtKey === option.key && styles.segmentTextActive]}>{option.label}</Text></TVPressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Banner Image URL (optional)</Text><TextInput style={[styles.input, focusedInput === 'bannerUrl' && styles.inputFocused]} value={bannerImageUri} onChangeText={setBannerImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('bannerUrl')} onBlur={() => setFocusedInput(null)} /></View>
        <View style={styles.field}><Text style={styles.label}>Bundled Banner Slot</Text><View style={styles.segmentWrap}>{PROFILE_BANNER_OPTIONS.map(option => <TVPressable key={option.key || 'none'} style={({ pressed, focused }: any) => [styles.segment, focused && styles.tvFocused, bannerBundledArtKey === option.key && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setBannerBundledArtKey(option.key)}><Text style={[styles.segmentText, bannerBundledArtKey === option.key && styles.segmentTextActive]}>{option.label}</Text></TVPressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Page Background Image URL (optional)</Text><TextInput style={[styles.input, focusedInput === 'bgUrl' && styles.inputFocused]} value={backgroundImageUri} onChangeText={setBackgroundImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" onFocus={() => setFocusedInput('bgUrl')} onBlur={() => setFocusedInput(null)} /><Text style={styles.help}>This sits behind the big buttons screen very lightly.</Text></View>

        <View style={styles.field}><Text style={styles.label}>Button Text Size</Text><View style={styles.segmentWrap}>{(['large','xlarge','xxlarge'] as FontSize[]).map(fs => <TVPressable key={fs} style={({ pressed, focused }: any) => [styles.segment, focused && styles.tvFocused, fontSize === fs && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setFontSize(fs)}><Text style={[styles.segmentText, fontSize === fs && styles.segmentTextActive]}>{fs === 'large' ? 'Large' : fs === 'xlarge' ? 'X-Large' : 'XX-Large'}</Text></TVPressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Button Columns</Text><View style={styles.segmentWrap}>{([1,2,3] as ColumnCount[]).map(c => <TVPressable key={c} style={({ pressed, focused }: any) => [styles.segment, focused && styles.tvFocused, columns === c && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setColumns(c)}><Text style={[styles.segmentText, columns === c && styles.segmentTextActive]}>{c} {c === 1 ? 'Column' : 'Columns'}</Text></TVPressable>)}</View></View>

        <View style={styles.field}><View style={styles.toggleRow}><View style={styles.toggleInfo}><Text style={styles.label}>Spoken Labels</Text><Text style={styles.toggleSubtitle}>Read button labels aloud when tapped</Text></View><TVPressable style={({ pressed, focused }: any) => [styles.toggle, focused && styles.tvFocusedSmall, spokenLabels && styles.toggleOn, pressed && styles.togglePressed]} onPress={() => setSpokenLabels(v => !v)}><View style={[styles.toggleThumb, spokenLabels && styles.toggleThumbOn]} /></TVPressable></View></View>

        {existing && <TVPressable style={({ pressed, focused }: any) => [styles.deleteButton, focused && styles.tvFocused, pressed && styles.deleteButtonPressed]} onPress={handleDelete}><IconSymbol name="trash.fill" size={18} color="#D32F2F" /><Text style={styles.deleteButtonText}>Delete Profile</Text></TVPressable>}
        <SaveButton bottom />
      </ScrollView>
      <StickySaveBar
        label="Save Profile"
        onPress={handleSave}
        disabled={!canSave}
        hint={canSave ? 'Press the MENU button on your remote to save.' : 'Add a name and make changes to enable Save.'}
      />
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
  content: { padding: Platform.isTV ? 34 : 20, gap: Platform.isTV ? 28 : 24, paddingBottom: 56 },
  contentWithStickyBar: { paddingBottom: Platform.isTV ? 200 : 140 },
  previewContainer: { paddingVertical: 8 }, previewRow: { flexDirection: 'row', alignItems: 'center', gap: 18, justifyContent: 'center' }, previewBanner: { minHeight: Platform.isTV ? 154 : 132, borderRadius: 24, overflow: 'hidden' }, previewBannerImage: { borderRadius: 24 }, previewShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', flexDirection: 'row', alignItems: 'center', gap: 18, padding: 20 }, previewAvatar: { width: 86, height: 86, borderRadius: 26, overflow: 'hidden' }, previewAvatarInner: { borderRadius: 26 }, previewAvatarFallback: { width: 86, height: 86, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }, previewEmoji: { fontSize: 42 }, previewName: { fontSize: Platform.isTV ? 36 : 28, fontWeight: '900' }, previewNameBanner: { fontSize: Platform.isTV ? 36 : 28, fontWeight: '900', color: '#FFFFFF' },
  field: { gap: 12 }, label: { fontSize: Platform.isTV ? 22 : 16, fontWeight: '800', color: '#1A1A1A' }, help: { fontSize: Platform.isTV ? 16 : 13, color: '#757575' }, input: { borderWidth: 3, borderColor: '#DADCE0', borderRadius: 16, padding: Platform.isTV ? 20 : 14, fontSize: Platform.isTV ? 24 : 18, color: '#1A1A1A', backgroundColor: '#FAFAFA' }, inputFocused: { borderWidth: 7, borderColor: '#000000', backgroundColor: '#FFFFFF' },
  emojiRow: { gap: 12, paddingVertical: 8 }, emojiOption: { width: Platform.isTV ? 70 : 52, height: Platform.isTV ? 70 : 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderWidth: 3, borderColor: '#DADCE0' }, emojiOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, emojiOptionPressed: { opacity: 0.7 }, emojiOptionText: { fontSize: Platform.isTV ? 36 : 26 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Platform.isTV ? 20 : 12, paddingVertical: 8 }, colorOption: { width: Platform.isTV ? 82 : 52, height: Platform.isTV ? 82 : 52, borderRadius: Platform.isTV ? 41 : 26, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#DADCE0' }, colorOptionSelected: { borderColor: '#000000' }, colorOptionPressed: { opacity: 0.8 },
  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, segment: { paddingVertical: Platform.isTV ? 16 : 12, paddingHorizontal: Platform.isTV ? 22 : 14, borderRadius: 16, borderWidth: 3, borderColor: '#DADCE0', backgroundColor: '#FFFFFF' }, segmentActive: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, segmentPressed: { opacity: 0.85 }, segmentText: { fontSize: Platform.isTV ? 20 : 15, color: '#333333', fontWeight: '800' }, segmentTextActive: { color: '#1565C0' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }, toggleInfo: { flex: 1 }, toggleSubtitle: { fontSize: Platform.isTV ? 17 : 13, color: '#757575', marginTop: 4 }, toggle: { width: 74, height: 42, borderRadius: 21, backgroundColor: '#E0E0E0', padding: 4, borderWidth: 3, borderColor: '#DADCE0' }, toggleOn: { backgroundColor: '#1565C0' }, togglePressed: { opacity: 0.8 }, toggleThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF' }, toggleThumbOn: { alignSelf: 'flex-end' },
  tvFocused: { ...tvFocusStyles.focused }, tvFocusedSmall: { ...tvFocusStyles.focusedSmall },
  bottomSaveBtn: { marginTop: 18, marginBottom: 42, backgroundColor: '#111111', paddingVertical: Platform.isTV ? 28 : 18, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#111111', flexDirection: 'row', gap: 12 },
  bottomSaveBtnText: { color: '#FFFFFF', fontSize: Platform.isTV ? 28 : 22, fontWeight: '900' },
  deleteButton: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: Platform.isTV ? 20 : 14, borderRadius: 18, borderWidth: 3, borderColor: '#FFCDD2', backgroundColor: '#FFEBEE' }, deleteButtonPressed: { opacity: 0.8 }, deleteButtonText: { fontSize: Platform.isTV ? 20 : 16, fontWeight: '800', color: '#D32F2F' },
});
