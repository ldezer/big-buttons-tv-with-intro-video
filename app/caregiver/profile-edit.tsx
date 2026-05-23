import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Platform, Alert, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { useApp } from '@/lib/app-context';
import { PROFILE_COLORS, ProfileSettings, FontSize, ColumnCount } from '@/lib/types';
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

  const avatarSource = useMemo(() => cleanImageUri(avatarImageUri) ? { uri: cleanImageUri(avatarImageUri) } : getBundledProfileArt(avatarBundledArtKey), [avatarImageUri, avatarBundledArtKey]);
  const bannerSource = useMemo(() => cleanImageUri(bannerImageUri) ? { uri: cleanImageUri(bannerImageUri) } : getBundledProfileArt(bannerBundledArtKey), [bannerImageUri, bannerBundledArtKey]);

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter a name for this profile.');
    const profileSettings: ProfileSettings = { spokenLabels, fontSize, columns };
    if (existing) {
      updateProfile({ ...existing, name: name.trim(), emoji, color, settings: profileSettings, avatarImageUri: cleanImageUri(avatarImageUri), avatarBundledArtKey, bannerImageUri: cleanImageUri(bannerImageUri), bannerBundledArtKey, backgroundImageUri: cleanImageUri(backgroundImageUri) });
    } else {
      const profile = addProfile(name.trim(), emoji, color, profileSettings);
      updateProfile({ ...profile, avatarImageUri: cleanImageUri(avatarImageUri), avatarBundledArtKey, bannerImageUri: cleanImageUri(bannerImageUri), bannerBundledArtKey, backgroundImageUri: cleanImageUri(backgroundImageUri) });
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => Alert.alert('Delete Profile', `Are you sure you want to delete "${existing?.name}"? All buttons will be removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteProfile(profileId!); router.back(); } }]);

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top','left','right','bottom']}>
      <View style={styles.header}>
        <Pressable style={({ pressed, focused }) => [styles.headerBtn, focused && styles.tvFocused, pressed && styles.headerBtnPressed]} onPress={() => router.back()}><Text style={styles.headerBtnText}>Cancel</Text></Pressable>
        <Text style={styles.headerTitle}>{existing ? 'Edit Profile' : 'New Profile'}</Text>
        <Pressable style={({ pressed, focused }) => [styles.headerBtn, styles.saveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed]} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewContainer}>
          {bannerSource ? <ImageBackground source={bannerSource} style={styles.previewBanner} imageStyle={styles.previewBannerImage}><View style={styles.previewShade}>{avatarSource ? <ImageBackground source={avatarSource} style={styles.previewAvatar} imageStyle={styles.previewAvatarInner} /> : <View style={[styles.previewAvatarFallback, { backgroundColor: color }]}><Text style={styles.previewEmoji}>{emoji}</Text></View>}<Text style={styles.previewNameBanner}>{name || 'Name'}</Text></View></ImageBackground> : <View style={styles.previewRow}>{avatarSource ? <ImageBackground source={avatarSource} style={styles.previewAvatar} imageStyle={styles.previewAvatarInner} /> : <View style={[styles.previewAvatarFallback, { backgroundColor: color }]}><Text style={styles.previewEmoji}>{emoji}</Text></View>}<Text style={[styles.previewName, { color }]}>{name || 'Name'}</Text></View>}
        </View>

        <View style={styles.field}><Text style={styles.label}>Name</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name..." placeholderTextColor="#BDBDBD" maxLength={30} /></View>

        <View style={styles.field}><Text style={styles.label}>Avatar Emoji</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>{PROFILE_EMOJIS.map(e => <Pressable key={e} style={({ pressed, focused }) => [styles.emojiOption, focused && styles.tvFocusedSmall, emoji === e && styles.emojiOptionSelected, pressed && styles.emojiOptionPressed]} onPress={() => setEmoji(e)}><Text style={styles.emojiOptionText}>{e}</Text></Pressable>)}</ScrollView></View>

        <View style={styles.field}><Text style={styles.label}>Profile Color</Text><View style={styles.colorRow}>{PROFILE_COLORS.map(c => <Pressable key={c} style={({ pressed, focused }) => [styles.colorOption, focused && styles.tvFocusedSmall, { backgroundColor: c }, color === c && styles.colorOptionSelected, pressed && styles.colorOptionPressed]} onPress={() => setColor(c)}>{color === c && <IconSymbol name="checkmark" size={18} color="#FFFFFF" />}</Pressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Avatar Image URL (optional)</Text><TextInput style={styles.input} value={avatarImageUri} onChangeText={setAvatarImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" /></View>
        <View style={styles.field}><Text style={styles.label}>Bundled Avatar Slot</Text><View style={styles.segmentWrap}>{PROFILE_AVATAR_OPTIONS.map(option => <Pressable key={option.key || 'none'} style={({ pressed, focused }) => [styles.segment, focused && styles.tvFocused, avatarBundledArtKey === option.key && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setAvatarBundledArtKey(option.key)}><Text style={[styles.segmentText, avatarBundledArtKey === option.key && styles.segmentTextActive]}>{option.label}</Text></Pressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Banner Image URL (optional)</Text><TextInput style={styles.input} value={bannerImageUri} onChangeText={setBannerImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" /></View>
        <View style={styles.field}><Text style={styles.label}>Bundled Banner Slot</Text><View style={styles.segmentWrap}>{PROFILE_BANNER_OPTIONS.map(option => <Pressable key={option.key || 'none'} style={({ pressed, focused }) => [styles.segment, focused && styles.tvFocused, bannerBundledArtKey === option.key && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setBannerBundledArtKey(option.key)}><Text style={[styles.segmentText, bannerBundledArtKey === option.key && styles.segmentTextActive]}>{option.label}</Text></Pressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Page Background Image URL (optional)</Text><TextInput style={styles.input} value={backgroundImageUri} onChangeText={setBackgroundImageUri} placeholder="https://..." autoCapitalize="none" keyboardType="url" placeholderTextColor="#BDBDBD" /><Text style={styles.help}>This sits behind the big buttons screen very lightly.</Text></View>

        <View style={styles.field}><Text style={styles.label}>Button Text Size</Text><View style={styles.segmentWrap}>{(['large','xlarge','xxlarge'] as FontSize[]).map(fs => <Pressable key={fs} style={({ pressed, focused }) => [styles.segment, focused && styles.tvFocused, fontSize === fs && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setFontSize(fs)}><Text style={[styles.segmentText, fontSize === fs && styles.segmentTextActive]}>{fs === 'large' ? 'Large' : fs === 'xlarge' ? 'X-Large' : 'XX-Large'}</Text></Pressable>)}</View></View>

        <View style={styles.field}><Text style={styles.label}>Button Columns</Text><View style={styles.segmentWrap}>{([1,2,3] as ColumnCount[]).map(c => <Pressable key={c} style={({ pressed, focused }) => [styles.segment, focused && styles.tvFocused, columns === c && styles.segmentActive, pressed && styles.segmentPressed]} onPress={() => setColumns(c)}><Text style={[styles.segmentText, columns === c && styles.segmentTextActive]}>{c} {c === 1 ? 'Column' : 'Columns'}</Text></Pressable>)}</View></View>

        <View style={styles.field}><View style={styles.toggleRow}><View style={styles.toggleInfo}><Text style={styles.label}>Spoken Labels</Text><Text style={styles.toggleSubtitle}>Read button labels aloud when tapped</Text></View><Pressable style={({ pressed, focused }) => [styles.toggle, focused && styles.tvFocusedSmall, spokenLabels && styles.toggleOn, pressed && styles.togglePressed]} onPress={() => setSpokenLabels(v => !v)}><View style={[styles.toggleThumb, spokenLabels && styles.toggleThumbOn]} /></Pressable></View></View>

        {existing && <Pressable style={({ pressed, focused }) => [styles.deleteButton, focused && styles.tvFocused, pressed && styles.deleteButtonPressed]} onPress={handleDelete}><IconSymbol name="trash.fill" size={18} color="#D32F2F" /><Text style={styles.deleteButtonText}>Delete Profile</Text></Pressable>}
        <Pressable style={({ pressed, focused }) => [styles.bottomSaveBtn, focused && styles.tvFocused, pressed && styles.saveBtnPressed]} onPress={handleSave}>
          <Text style={styles.bottomSaveBtnText}>Save Profile</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }, headerBtnPressed: { backgroundColor: '#F5F5F5' }, headerBtnText: { fontSize: 16, color: '#757575' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' }, saveBtn: { backgroundColor: '#1565C0', borderRadius: 50 }, saveBtnPressed: { opacity: 0.8 }, saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  content: { padding: 20, gap: 24, paddingBottom: 48 }, previewContainer: { paddingVertical: 8 }, previewRow: { flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'center' }, previewBanner: { minHeight: 132, borderRadius: 24, overflow: 'hidden' }, previewBannerImage: { borderRadius: 24 }, previewShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }, previewAvatar: { width: 72, height: 72, borderRadius: 24, overflow: 'hidden' }, previewAvatarInner: { borderRadius: 24 }, previewAvatarFallback: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, previewEmoji: { fontSize: 34 }, previewName: { fontSize: 28, fontWeight: '700' }, previewNameBanner: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  field: { gap: 10 }, label: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' }, help: { fontSize: 13, color: '#757575' }, input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 18, color: '#1A1A1A', backgroundColor: '#FAFAFA' },
  emojiRow: { gap: 8, paddingVertical: 4 }, emojiOption: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: 'transparent' }, emojiOptionSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, emojiOptionPressed: { opacity: 0.7 }, emojiOptionText: { fontSize: 26 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Platform.isTV ? 18 : 12, paddingVertical: 6 }, colorOption: { width: Platform.isTV ? 70 : 52, height: Platform.isTV ? 70 : 52, borderRadius: Platform.isTV ? 35 : 26, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#111111' }, colorOptionSelected: { borderColor: '#1A1A1A' }, colorOptionPressed: { opacity: 0.8 },
  segmentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, segment: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' }, segmentActive: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' }, segmentPressed: { opacity: 0.85 }, segmentText: { fontSize: 15, color: '#616161', fontWeight: '600' }, segmentTextActive: { color: '#1565C0' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, toggleInfo: { flex: 1 }, toggleSubtitle: { fontSize: 13, color: '#757575', marginTop: 4 }, toggle: { width: 62, height: 36, borderRadius: 18, backgroundColor: '#E0E0E0', padding: 3 }, toggleOn: { backgroundColor: '#1565C0' }, togglePressed: { opacity: 0.8 }, toggleThumb: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF' }, toggleThumbOn: { alignSelf: 'flex-end' },
  tvFocused: { borderWidth: 5, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 16, elevation: 16, transform: [{ scale: 1.03 }] },
  tvFocusedSmall: { borderWidth: 4, borderColor: '#000000', shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.75, shadowRadius: 12, elevation: 14, transform: [{ scale: 1.08 }] },
  bottomSaveBtn: { marginTop: 16, marginBottom: 32, backgroundColor: '#111111', paddingVertical: Platform.isTV ? 24 : 18, borderRadius: 22, alignItems: 'center', borderWidth: 4, borderColor: '#111111' },
  bottomSaveBtnText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  deleteButton: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: '#FFCDD2', backgroundColor: '#FFEBEE' }, deleteButtonPressed: { opacity: 0.8 }, deleteButtonText: { fontSize: 16, fontWeight: '700', color: '#D32F2F' },
});
