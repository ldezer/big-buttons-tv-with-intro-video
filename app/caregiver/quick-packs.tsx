import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useProfiles } from '@/lib/profiles-context';
import { QUICK_PACKS } from '@/lib/quick-packs';
import { QuickPack } from '@/lib/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TVPressable } from '@/components/tv/tv-pressable';

function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

export default function QuickPacksScreen() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const router = useRouter();
  const { profiles, addButton } = useProfiles();
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const handleTogglePack = (packId: string) => {
    setExpandedPack(prev => prev === packId ? null : packId);
  };

  const handleApplyPack = (pack: QuickPack, targetProfileId: string) => {
    const profile = profiles.find(p => p.id === targetProfileId);
    if (!profile) return;

    const existingCount = profile.buttons.length;
    pack.buttons.forEach((btn, i) => {
      addButton(targetProfileId, { ...btn, order: existingCount + i });
    });

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '✅ Pack Applied!',
      `Added ${pack.buttons.length} buttons to ${profile.name}.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  const handleApply = (pack: QuickPack) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (profileId) {
      // Direct apply to specific profile
      handleApplyPack(pack, profileId);
    } else if (profiles.length === 0) {
      Alert.alert('No Profiles', 'Please create a profile first before applying a pack.');
    } else if (profiles.length === 1) {
      handleApplyPack(pack, profiles[0].id);
    } else {
      // Show profile picker
      Alert.alert(
        'Apply to Profile',
        'Which profile should receive these buttons?',
        [
          ...profiles.map(p => ({
            text: `${p.emoji} ${p.name}`,
            onPress: () => handleApplyPack(pack, p.id),
          })),
          { text: 'Cancel', style: 'cancel' as const },
        ]
      );
    }
  };

  return (
    <ScreenContainer containerClassName="bg-white" edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TVPressable
          style={({ pressed }: any) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={22} color="#1565C0" />
        </TVPressable>
        <Text style={styles.headerTitle}>Quick Packs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Apply a pre-made set of buttons to a profile instantly.
        </Text>

        {QUICK_PACKS.map(pack => {
          const isExpanded = expandedPack === pack.id;
          return (
            <View key={pack.id} style={styles.packCard}>
              {/* Pack Header */}
              <TVPressable
                style={({ pressed }: any) => [styles.packHeader, pressed && styles.packHeaderPressed]}
                onPress={() => handleTogglePack(pack.id)}
              >
                <Text style={styles.packEmoji}>{pack.emoji}</Text>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packDesc}>{pack.description}</Text>
                </View>
                <View style={styles.packRight}>
                  <Text style={styles.packCount}>{pack.buttons.length} buttons</Text>
                  <IconSymbol
                    name={isExpanded ? 'chevron.left' : 'chevron.right'}
                    size={18}
                    color="#757575"
                  />
                </View>
              </TVPressable>

              {/* Expanded Preview */}
              {isExpanded && (
                <View style={styles.packExpanded}>
                  {/* Button Preview Grid */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.previewRow}
                  >
                    {pack.buttons.map((btn, i) => (
                      <View
                        key={i}
                        style={[styles.previewBtn, { backgroundColor: btn.color }]}
                      >
                        <Text style={styles.previewBtnEmoji}>{btn.emoji}</Text>
                        <Text
                          style={[styles.previewBtnLabel, { color: getTextColor(btn.color) }]}
                          numberOfLines={1}
                        >
                          {btn.label}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Apply Button */}
                  <TVPressable
                    style={({ pressed }: any) => [styles.applyButton, pressed && styles.applyButtonPressed]}
                    onPress={() => handleApply(pack)}
                  >
                    <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                    <Text style={styles.applyButtonText}>
                      Apply "{pack.name}" Pack
                    </Text>
                  </TVPressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 48,
  },
  intro: {
    fontSize: 15,
    color: '#757575',
    lineHeight: 22,
  },
  packCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  packHeaderPressed: {
    backgroundColor: '#F0F0F0',
  },
  packEmoji: {
    fontSize: 36,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  packDesc: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  packRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  packCount: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  packExpanded: {
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  previewRow: {
    gap: 10,
    paddingVertical: 4,
  },
  previewBtn: {
    width: 80,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  previewBtnEmoji: {
    fontSize: 28,
    marginBottom: 4,
    lineHeight: 34,
  },
  previewBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonPressed: {
    opacity: 0.8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
