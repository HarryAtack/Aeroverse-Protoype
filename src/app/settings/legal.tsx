import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';

const DOCS: Record<string, { title: string; sections: [string, string][] }> = {
  terms: { title: 'Terms of Service', sections: [
    ['1. About these terms', 'Placeholder. These terms will govern your use of AeroVerse. Final terms will be prepared with legal counsel before launch.'],
    ['2. Your account', 'You must provide accurate information and keep your credentials secure. You must be at least 13 (or the age of digital consent in your country).'],
    ['3. Your content', 'You keep ownership of photos you upload. You grant AeroVerse a limited licence to host and display them within the service. Commercial use requires a separate, explicit licence.'],
    ['4. Acceptable use', 'No trespassing, no unsafe behaviour, no harassment, no sharing of sensitive military information, and no manipulation of verification or leaderboards.'],
    ['5. Digital items', 'Digital cards and XP have no monetary value and cannot be exchanged for cash.'],
  ] },
  privacy: { title: 'Privacy Policy', sections: [
    ['Summary', 'Placeholder. AeroVerse collects only what it needs to run the service. Precise location is optional, stays on your device, and is never shown to other users.'],
    ['What we collect', 'Account details, content you upload (with EXIF location stripped), activity in the app, and optional device location used locally for nearby features.'],
    ['Your rights', 'Access, correction, export (Settings → Export my data) and deletion (Settings → Delete account). Contact details will be provided at launch.'],
    ['Processors', 'Production processors (e.g. Supabase, Stripe, image recognition provider, flight data provider) will be listed here with their purposes.'],
  ] },
  guidelines: { title: 'Community guidelines', sections: [
    ['Be safe', 'Spot from public land only. Never enter airside or restricted areas, obstruct roads, or fly drones near airports.'],
    ['Be accurate', 'Don’t claim identifications you’re unsure about. Use corrections and the review queue.'],
    ['Be kind', 'Critique photos, not people. Harassment and hate are not tolerated.'],
    ['Respect sensitivity', 'Do not post operational military movements, security procedures or restricted areas.'],
  ] },
  photos: { title: 'Photo rights & licensing', sections: [
    ['Ownership', 'Photographers keep copyright in their photographs.'],
    ['Display licence', 'Uploading grants AeroVerse a non-exclusive licence to display your photo inside the app (feed, profile, competitions you enter).'],
    ['Commercial use', 'Physical cards, prints, advertising or any commercial use require your separate, explicit, opt-in licence — with credit and payment.'],
    ['Demo imagery', 'This prototype uses Wikimedia Commons photographs under their Creative Commons / public domain licences. Credits are shown on each photo and in Settings → Photo attributions.'],
  ] },
};

export default function Legal() {
  const { doc = 'terms' } = useLocalSearchParams<{ doc: string }>();
  const d = DOCS[doc] ?? DOCS.terms;
  return (
    <Screen header={<Header title={d.title} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice icon="document-text-outline" color={colors.cyan} text="Placeholder document for the prototype. Not legal advice." />
        {d.sections.map(([h, b]) => <View key={h} style={{ gap: 4 }}><T v="title">{h}</T><T muted>{b}</T></View>)}
      </View>
    </Screen>
  );
}
