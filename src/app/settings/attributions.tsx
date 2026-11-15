import React from 'react';
import { Linking, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Card, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { photos } from '@/data/photos';

export default function Attributions() {
  const list = Object.values(photos);
  return (
    <Screen header={<Header title="Photo attributions" subtitle={`${list.length} images`} />}>
      <View style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <T muted>Demo imagery is sourced from Wikimedia Commons and used under the licences listed. Map data: Natural Earth (public domain). Fonts: Space Grotesk & Inter (SIL OFL).</T>
        {list.map((p) => (
          <Card key={p.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Photo id={p.id} style={{ width: 64, height: 48, borderRadius: 8 }} credit={false} />
            <View style={{ flex: 1, gap: 2 }}>
              <T v="smallMedium" numberOfLines={2}>{p.title}</T>
              <T v="caption" muted>© {p.author} · {p.license}</T>
              {p.sourceUrl && <Tap onPress={() => Linking.openURL(p.sourceUrl!)}><T v="caption" color={colors.primary}>View source on Wikimedia Commons</T></Tap>}
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
