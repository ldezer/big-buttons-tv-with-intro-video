import { Redirect } from 'expo-router';

// The main app entry point is at app/index.tsx (no tabs)
// This redirect ensures any deep-link to (tabs) goes to the root
export default function TabsIndex() {
  return <Redirect href="/" />;
}
