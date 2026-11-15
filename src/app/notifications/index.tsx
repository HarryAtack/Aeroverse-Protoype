import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import type { NotificationCategory } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Chip, EmptyState, IconButton, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { useApp } from '@/store/useApp';
import { timeAgo } from '@/utils/format';
import { catMeta } from '@/components/notificationMeta';


export default function Notifications() {
  const list = useApp((s) => s.notifications);
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationCategory>('all');
  const shown = list.filter((n) => filter === 'all' || (filter === 'unread' ? !n.read : n.category === filter));
  const { markNotificationRead, markAllRead, pushNotification } = useApp.getState();
  return (
    <Screen header={<Header title="Notifications" right={<IconButton icon="settings-outline" accessibilityLabel="Notification settings" onPress={() => router.push('/notifications/settings')} />} />}>
      <View style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Chip small label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip small label={`Unread (${list.filter((n) => !n.read).length})`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
          {(['rare_alert', 'follower', 'challenge', 'competition'] as NotificationCategory[]).map((c) => <Chip key={c} small label={catMeta[c].label.split(' ')[0]} active={filter === c} onPress={() => setFilter(c)} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Mark all read" small variant="secondary" full={false} onPress={markAllRead} />
          <Button title="Send test alert" small variant="ghost" full={false} onPress={() => pushNotification({ category: 'rare_alert', title: 'Test rare alert', body: 'Boeing 747-8F approaching your home airport (simulated).', route: '/radar' })} />
        </View>
        {shown.length === 0 && <EmptyState icon="notifications-off-outline" title="You’re all caught up" body="New likes, followers, alerts and challenge updates will appear here." />}
        {shown.map((n) => {
          const m = catMeta[n.category];
          return (
            <Tap key={n.id} onPress={() => { markNotificationRead(n.id); if (n.route) router.push(n.route as never); }} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: n.read ? 'transparent' : 'rgba(61,139,255,0.08)', borderWidth: 1, borderColor: n.read ? 'transparent' : colors.border }}>
              {n.actorId ? <Avatar userId={n.actorId} size={42} /> : (
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: m.color + '22', alignItems: 'center', justifyContent: 'center' }}><Ionicons name={m.icon as never} size={20} color={m.color} /></View>
              )}
              <View style={{ flex: 1 }}>
                <T v="bodyMedium">{n.title}</T>
                <T v="small" muted numberOfLines={2}>{n.body}</T>
                <T v="caption" dim>{timeAgo(n.createdAt)} · {m.label}</T>
              </View>
              {n.photoId && <Photo id={n.photoId} style={{ width: 48, height: 48, borderRadius: 8 }} credit={false} />}
              {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cyan }} />}
            </Tap>
          );
        })}
      </View>
    </Screen>
  );
}
