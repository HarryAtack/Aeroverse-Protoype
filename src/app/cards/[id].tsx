import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Card, EmptyState, ListRow, Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { TradingCardView } from '@/components/aviation';
import { cards } from '@/data/community';
import { airlineById, manufacturerById, typeById } from '@/data/catalog';
import { getPhoto } from '@/data/photos';
import { useApp } from '@/store/useApp';
import { rarityLabel } from '@/services/rarity';

export default function CardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cards.find((c) => c.id === id);
  const owned = useApp((s) => s.ownedCards.find((o) => o.cardId === id));
  if (!card) return <Screen header={<Header title="Card" />}><EmptyState title="Card not found" /></Screen>;
  const t = typeById[card.typeId];
  const p = getPhoto(card.photoId);
  return (
    <Screen header={<Header title={card.number} subtitle={card.series} />}>
      <View style={{ alignItems: 'center', gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <TradingCardView card={card} width={260} owned={!!owned} />
        {!owned && <Notice icon="lock-closed-outline" color={colors.cyan} text="You don’t own this card yet. Open packs or complete challenges to find it." />}
        <Card padded={false} style={{ alignSelf: 'stretch' }}>
          <ListRow icon="airplane-outline" title={`${manufacturerById[t?.manufacturerId]?.name} ${t?.variant}`} subtitle="Aircraft type" onPress={() => router.push(`/aircraft/${card.typeId}`)} />
          <ListRow icon="barcode-outline" title={card.registration ?? 'Not specified'} subtitle="Registration" />
          <ListRow icon="business-outline" title={airlineById[card.airlineId]?.name ?? ''} subtitle="Airline / operator" />
          <ListRow icon="diamond-outline" title={rarityLabel[card.rarity]} subtitle={card.specialEdition ? `Special edition · ${card.specialEdition}${card.limitedRun ? ` · limited to ${card.limitedRun}` : ''}` : 'Rarity'} />
          <ListRow icon="albums-outline" title={card.series} subtitle={`Card number ${card.number}`} />
          <ListRow icon="camera-outline" title={p ? p.author : 'AeroVerse'} subtitle={p ? `Photographer credit · ${p.license}` : 'Illustration'} />
          {owned && <ListRow icon="copy-outline" title={`You own ×${owned.count}`} subtitle={owned.count > 1 ? `${owned.count - 1} duplicate(s) available for future trading` : 'No duplicates'} />}
        </Card>
        <T v="caption" dim center>Physical versions of community photos are only produced with the photographer’s explicit licence and credit.</T>
      </View>
    </Screen>
  );
}
