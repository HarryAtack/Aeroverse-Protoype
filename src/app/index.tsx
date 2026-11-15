import { Redirect } from 'expo-router';
import { useApp } from '@/store/useApp';

/** Entry gate: intro → auth → profile setup → app. */
export default function Index() {
  const introSeen = useApp((s) => s.introSeen);
  const session = useApp((s) => s.session);
  const profile = useApp((s) => s.profile);
  if (!introSeen) return <Redirect href="/welcome" />;
  if (!session) return <Redirect href="/auth/sign-in" />;
  if (!profile?.username) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
