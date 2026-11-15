import React, { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, rarityColors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, Notice, ProgressBar, Segmented, Tap } from '@/components/ui/primitives';
import { Header, Screen, Sheet } from '@/components/ui/Screen';
import { TradingCardView } from '@/components/aviation';
import { cards, cardSeries, packTypes } from '@/data/community';
import { useApp } from '@/store/useApp';
import { RARITY_ORDER, rarityLabel } from '@/services/rarity';
import type { Rarity } from '@/types/domain';

type Tab = 'collection' | 'sets' | 'duplicates' | 'market';

export default function Cards() {
  const { width } = useWindowDimensions();
  const owned = useApp((s) => s.ownedCards);
  const packs = useApp((s) => s.packs);
  const lastDaily = useApp((s) => s.lastDailyPack);
  const waitlist = useApp((s) => s.marketplaceWaitlist);
  const [tab, setTab] = useState<Tab>('collection');
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const [odds, setOdds] = useState<string | null>(null);
  const cw = (Math.min(width, 640) - space.lg * 2 - 20) / 3;
  const ownedMap = useMemo(() => Object.fromEntries(owned.map((o) => [o.cardId, o.count])), [owned]);
  const list = cards.filter((c) => filter === 'all' || c.rarity === filter);
  const dupes = owned.filter((o) => o.count > 1);
  const canDaily = lastDaily !== new Date().toDateString();

  return (
    <Screen header={<Header title="Digital Cards" subtitle={`${owned.length}/${cards.length} collected · Series 1`} right={<Button title="Store" icon="bag-handle-outline" small full={false} variant="secondary" onPress={() => router.push('/store')} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {packTypes.map((p) => (
            <Card key={p.id} style={{ width: 260, gap: 10, overflow: 'hidden' }}>
              <LinearGradient colors={p.id === 'pk_challenge' ? ['rgba(180,108,255,0.35)', 'transparent'] : ['rgba(61,139,255,0.35)', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="gift" size={26} color={p.id === 'pk_challenge' ? rarityColors.epic : colors.cyan} />
                <View style={{ flex: 1 }}>
                  <T v="title">{p.name}</T>
                  <T v="caption" muted>{p.cards} cards · {p.guarantee}</T>
                </View>
                <T v="dataLarge">×{packs[p.id] ?? 0}</T>
              </View>
              <Button title={(packs[p.id] ?? 0) > 0 ? 'Open pack' : 'No packs'} icon="sparkles" small disabled={(packs[p.id] ?? 0) < 1} onPress={() => router.push(`/cards/open?pack=${p.id}`)} />
              <Tap onPress={() => setOdds(p.id)}><T v="caption" color={colors.primary}>View contents & odds</T></Tap>
            </Card>
          ))}
        </ScrollView>
        <Notice icon="shield-checkmark-outline" color={colors.cyan} text="Packs are earned through challenges, milestones and a free daily pack — never sold for money. Odds are always shown before opening." />
        <Button title={canDaily ? 'Claim free daily pack' : 'Daily pack claimed — back tomorrow'} icon="calendar-outline" variant="secondary" disabled={!canDaily} onPress={() => { if (useApp.getState().claimDailyPack()) useApp.getState().showToast('Daily pack added!'); }} />

        <Segmented<Tab> value={tab} onChange={setTab} options={[{ key: 'collection', label: 'Cards' }, { key: 'sets', label: 'Sets' }, { key: 'duplicates', label: `Dupes (${dupes.length})` }, { key: 'market', label: 'Trade' }]} />

        {tab === 'collection' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              <Chip small label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              {RARITY_ORDER.map((r) => <Chip key={r} small label={rarityLabel[r]} active={filter === r} onPress={() => setFilter(r)} color={rarityColors[r]} />)}
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {list.map((c) => <TradingCardView key={c.id} card={c} width={cw} owned={!!ownedMap[c.id]} count={ownedMap[c.id]} onPress={() => router.push(`/cards/${c.id}`)} />)}
            </View>
          </>
        )}
        {tab === 'sets' && cardSeries.map((s) => {
          const inSet = cards.filter((c) => c.series === s.id);
          const have = inSet.filter((c) => ownedMap[c.id]).length;
          return (
            <Card key={s.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name={s.icon as never} size={20} color={colors.cyan} />
                <T v="title" style={{ flex: 1 }}>{s.name}</T>
                <T v="data" color={have === inSet.length ? colors.success : colors.text}>{have}/{inSet.length}</T>
              </View>
              <ProgressBar value={have / inSet.length} color={have === inSet.length ? colors.success : colors.primary} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {inSet.map((c) => <TradingCardView key={c.id} card={c} width={84} owned={!!ownedMap[c.id]} onPress={() => router.push(`/cards/${c.id}`)} />)}
              </ScrollView>
            </Card>
          );
        })}
        {tab === 'duplicates' && (
          dupes.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {dupes.map((o) => { const c = cards.find((x) => x.id === o.cardId)!; return <TradingCardView key={o.cardId} card={c} width={cw} count={o.count} onPress={() => router.push(`/cards/${c.id}`)} />; })}
            </View>
          ) : <T muted>No duplicates yet.</T>
        )}
        {tab === 'market' && (
          <Card style={{ gap: 10, alignItems: 'center' }}>
            <Ionicons name="swap-horizontal" size={34} color={colors.cyan} />
            <T v="h3" center>Card trading — coming soon</T>
            <T muted center>Swap duplicates with other collectors. Trades will be card-for-card with no cash value, and protected against scams.</T>
            <Button title={waitlist ? 'You’re on the waitlist ✓' : 'Join the trading waitlist'} variant={waitlist ? 'secondary' : 'primary'} onPress={() => { useApp.getState().setWaitlist(!waitlist); useApp.getState().showToast(waitlist ? 'Removed from waitlist' : 'We’ll let you know when trading opens'); }} />
          </Card>
        )}
      </View>
      <Sheet visible={!!odds} onClose={() => setOdds(null)} title="Pack contents & odds">
        {odds && (() => {
          const p = packTypes.find((x) => x.id === odds)!;
          return (
            <View style={{ gap: 10 }}>
              <T muted>{p.cards} cards per pack. Guarantee: {p.guarantee}. Each card slot is drawn independently with these probabilities:</T>
              {RARITY_ORDER.map((r) => (
                <View key={r} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T color={rarityColors[r]}>{rarityLabel[r]}</T>
                  <T v="data">{(p.odds[r] * 100).toFixed(1)}%</T>
                </View>
              ))}
              <T v="caption" dim>Packs cannot be purchased. Digital cards have no monetary value and cannot be cashed out.</T>
            </View>
          );
        })()}
      </Sheet>
    </Screen>
  );
}
