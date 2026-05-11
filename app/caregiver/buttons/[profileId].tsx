import React from 'react';
import {
  View,
  Text,
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
import { BigButton } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { cleanImageUri, getBundledButtonArt } from '@/lib/art';

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

function getActionLabel(button: BigButton): string {
  switch (button.action.type) {
    case 'google-images': return `🖼️ Images: "${button.action.query}"`;
    case 'youtube': return `▶️ YouTube: "${button.action.query}"`;
    case 'choice': return `🔀 Choice: "${button.action.query}"`;
    case 'url': return `🔗 URL`;
  }
}

export default function ButtonsEditor() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const router = useRouter();
  const { getProfile, deleteButton, toggleFavorite } = useProfiles();

  const profile = getProfile(profileId);

  const handleAddButton = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/caregiver/button-edit', params: { profileId } });
  };

  const handleEditButton = (button: BigButton) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/caregiver/button-edit', params: { profileId, buttonId: button.id } });
  };

  const handleDeleteButton = (button: BigButton) => {
    Alert.alert(
      'Delete Button',
      `Remove "${button.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteButton(profileId, button.id),
        },
      ]
    );
  };

  const handleToggleFavorite = (button: BigButton) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(profileId, button.id);
  };

  const handleQuickPacks = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/caregiver/quick-packs', params: { profileId } });
  };

  if (!profile) {
    return (
      <ScreenContainer containerClassName="bg-white">
        <View style={styles.centered}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const sortedButtons = [...profile.buttons].sort((a, b) => a.order - b.order);

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{profile.emoji} {profile.name}</Text>
          <Text style={styles.headerSubtitle}>{sortedButtons.length} buttons</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          onPress={handleAddButton}
          accessibilityRole="button"
          accessibilityLabel="Add new button"
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Quick Packs Banner */}
      <Pressable
        style={({ pressed }) => [styles.quickPacksBanner, pressed && styles.quickPacksBannerPressed]}
        onPress={handleQuickPacks}
        accessibilityRole="button"
        accessibilityLabel="Add buttons from quick packs"
      >
        <Text style={styles.quickPacksBannerText}>⚡ Add buttons from Quick Packs</Text>
        <IconSymbol name="chevron.right" size={16} color="#F9A825" />
      </Pressable>

      {/* Button List */}
      {sortedButtons.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>➕</Text>
          <Text style={styles.emptyTitle}>No buttons yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button above or use Quick Packs to add buttons.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyAddBtn, pressed && styles.emptyAddBtnPressed]}
            onPress={handleAddButton}
          >
            <Text style={styles.emptyAddBtnText}>Add First Button</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {sortedButtons.map(button => {
            const artSource = cleanImageUri(button.imageUri) ? { uri: cleanImageUri(button.imageUri) } : getBundledButtonArt(button.bundledArtKey);
            return (
              <View key={button.id} style={styles.buttonRow}>
                {artSource ? (
                  <ImageBackground source={artSource} style={[styles.buttonPreview, { backgroundColor: button.color }]} imageStyle={styles.buttonPreviewImage}>
                    <View style={styles.buttonPreviewShade}><Text style={styles.buttonPreviewEmoji}>{button.emoji}</Text></View>
                  </ImageBackground>
                ) : (
                  <View style={[styles.buttonPreview, { backgroundColor: button.color }]}>
                    <Text style={styles.buttonPreviewEmoji}>{button.emoji}</Text>
                  </View>
                )}

                {/* Info */}
                <View style={styles.buttonInfo}>
                  <Text style={styles.buttonLabel}>{button.label}</Text>
                  <Text style={styles.buttonAction} numberOfLines={1}>
                    {getActionLabel(button)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.buttonActions}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                    onPress={() => handleToggleFavorite(button)}
                    accessibilityRole="button"
                    accessibilityLabel={button.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <IconSymbol
                      name={button.isFavorite ? 'star.fill' : 'star'}
                      size={20}
                      color={button.isFavorite ? '#F9A825' : '#BDBDBD'}
                    />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                    onPress={() => handleEditButton(button)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${button.label}`}
                  >
                    <IconSymbol name="pencil" size={20} color="#1565C0" />
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                    onPress={() => handleDeleteButton(button)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${button.label}`}
                  >
                    <IconSymbol name="trash" size={20} color="#D32F2F" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: {
    backgroundColor: '#F5F5F5',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    opacity: 0.8,
  },
  quickPacksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  quickPacksBannerPressed: {
    backgroundColor: '#FFF3CD',
  },
  quickPacksBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 12,
  },
  buttonPreview: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  buttonPreviewImage: {
    borderRadius: 14,
  },
  buttonPreviewShade: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  buttonPreviewEmoji: {
    fontSize: 28,
  },
  buttonInfo: {
    flex: 1,
    gap: 4,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  buttonAction: {
    fontSize: 12,
    color: '#757575',
  },
  buttonActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPressed: {
    backgroundColor: '#E0E0E0',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAddBtn: {
    marginTop: 8,
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  emptyAddBtnPressed: {
    opacity: 0.8,
  },
  emptyAddBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
