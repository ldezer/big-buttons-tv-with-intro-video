import { Stack } from 'expo-router';

export default function CaregiverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="buttons/[profileId]" />
      <Stack.Screen name="button-edit" />
      <Stack.Screen name="quick-packs" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
