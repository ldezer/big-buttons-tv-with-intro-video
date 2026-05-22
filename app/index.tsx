import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useProfiles } from '@/lib/profiles-context';

const INTRO_VIDEO = require('@/assets/video/intro.mp4');
let introAlreadyPlayedThisSession = false;

function IntroVideo({ onFinish }: { onFinish: () => void }) {
  const [finishing, setFinishing] = useState(false);

  const finish = useCallback(() => {
    setFinishing(current => {
      if (!current) onFinish();
      return true;
    });
  }, [onFinish]);

  const player = useVideoPlayer(INTRO_VIDEO, videoPlayer => {
    videoPlayer.loop = false;
    videoPlayer.muted = false;
    videoPlayer.play();
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Safety fallback: the intro is about 6 seconds. If the TV refuses to
    // report the ending event, still enter the app instead of going black.
    const fallback = setTimeout(finish, 7400);

    let endSubscription: { remove: () => void } | undefined;
    let statusSubscription: { remove: () => void } | undefined;

    try {
      endSubscription = (player as any).addListener?.('playToEnd', finish);
    } catch {}

    try {
      statusSubscription = (player as any).addListener?.('statusChange', (event: any) => {
        if (event?.status === 'error') finish();
      });
    } catch {}

    return () => {
      clearTimeout(fallback);
      try { endSubscription?.remove?.(); } catch {}
      try { statusSubscription?.remove?.(); } catch {}
      try { player.pause(); } catch {}
    };
  }, [finish, player]);

  return (
    <View style={styles.introScreen}>
      <VideoView
        player={player}
        style={styles.introVideo}
        nativeControls={false}
        contentFit="cover"
        allowsFullscreen={false}
      />
      {finishing ? (
        <View style={styles.openingOverlay}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.openingText}>Opening Big Buttons...</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ModeSelector() {
  const router = useRouter();
  const { profiles, loading } = useProfiles();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [introDone, setIntroDone] = useState(introAlreadyPlayedThisSession);
  const [hasNavigated, setHasNavigated] = useState(false);

  const firstProfile = useMemo(() => profiles[0], [profiles]);

  const finishIntro = useCallback(() => {
    introAlreadyPlayedThisSession = true;
    setIntroDone(true);
  }, []);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  useEffect(() => {
    if (!introDone || loading || hasNavigated) return;
    setHasNavigated(true);

    // No start screen. After the intro video, enter the main app directly.
    if (firstProfile) {
      router.replace(`/loved-one/${firstProfile.id}`);
    } else {
      router.replace('/caregiver');
    }
  }, [introDone, loading, hasNavigated, firstProfile, router]);

  if (!introDone) {
    return <IntroVideo onFinish={finishIntro} />;
  }

  return (
    <View style={[styles.screen, isLandscape && styles.screenLandscape]}>
      <Image source={require('@/assets/images/custom/big-buttons-logo.jpg')} style={styles.loadingLogo} resizeMode="contain" />
      <ActivityIndicator size="large" color="#1565C0" />
      <Text style={styles.loadingText}>Opening Big Buttons...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  introScreen: { flex: 1, backgroundColor: '#000000' },
  introVideo: { flex: 1, width: '100%', height: '100%' },
  openingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.35)' },
  openingText: { marginTop: 16, fontSize: Platform.isTV ? 26 : 18, fontWeight: '900', color: '#1565C0' },
  screen: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 32 },
  screenLandscape: { paddingHorizontal: 80 },
  loadingLogo: { width: 180, height: 180, marginBottom: 24 },
  loadingText: { marginTop: 18, fontSize: Platform.isTV ? 26 : 22, fontWeight: '700', color: '#1565C0' },
});
