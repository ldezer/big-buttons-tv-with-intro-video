import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useProfiles } from '@/lib/profiles-context';

export default function ModeSelector() {
  const router = useRouter();
  const { profiles, loading } = useProfiles();
  const firstProfile = useMemo(() => profiles[0], [profiles]);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (loading) return;
    if (firstProfile) {
      router.replace(`/loved-one/${firstProfile.id}`);
    } else {
      router.replace('/caregiver');
    }
  }, [loading, firstProfile, router]);

  return (
    <View style={styles.screen}>
      <Image source={require('@/assets/images/custom/big-buttons-logo.jpg')} style={styles.loadingLogo} resizeMode="contain" />
      <ActivityIndicator size="large" color="#000000" />
      <Text style={styles.loadingText}>Opening Big Buttons...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingLogo: { width: Platform.isTV ? 280 : 180, height: Platform.isTV ? 180 : 120, marginBottom: 24 },
  loadingText: { marginTop: 18, fontSize: Platform.isTV ? 26 : 22, fontWeight: '800', color: '#111111' },
});
