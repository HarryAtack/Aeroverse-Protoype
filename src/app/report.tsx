import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Input, Tap, ToggleRow } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { useApp } from '@/store/useApp';
import { userById } from '@/data/users';
import { postById } from '@/data/posts';

const REASONS = ['Spam or scam', 'Harassment or hate', 'Stolen photo / copyright', 'Trespassing or unsafe behaviour', 'Sensitive military information', 'Wrong identification', 'Inappropriate content', 'Something else'];

export default function Report() {
  const { type = 'post', id = '' } = useLocalSearchParams<{ type: 'post' | 'user' | 'comment' | 'spot'; id: string }>();
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState('');
  const [blockToo, setBlockToo] = useState(false);
  const [sent, setSent] = useState(false);
  const owner = type === 'user' ? id : type === 'post' ? postById[id]?.userId : undefined;
  const submit = () => {
    if (!reason) return;
    const st = useApp.getState();
    st.report(type, id, `${reason}${details ? `: ${details}` : ''}`);
    if (blockToo && owner) st.block(owner);
    setSent(true);
  };
  if (sent) {
    return (
      <Screen header={<Header title="Report sent" back={false} />}>
        <View style={{ alignItems: 'center', gap: space.lg, paddingTop: space.xxl }}>
          <Ionicons name="shield-checkmark" size={64} color={colors.success} />
          <T v="h2" center>Thanks for keeping AeroVerse safe</T>
          <T muted center>Our moderation team reviews reports within 24 hours. We’ll notify you of the outcome. The reported person isn’t told who reported them.</T>
          <Button title="Done" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }
  return (
    <Screen header={<Header title={`Report ${type}`} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <T muted>Why are you reporting this {type}{owner ? ` from @${userById[owner]?.username}` : ''}?</T>
        <Card padded={false}>
          {REASONS.map((r) => (
            <Tap key={r} onPress={() => setReason(r)} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }} accessibilityRole="radio" accessibilityState={{ checked: reason === r }}>
              <Ionicons name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={reason === r ? colors.primary : colors.textDim} />
              <T>{r}</T>
            </Tap>
          ))}
        </Card>
        <Input label="Details (optional)" value={details} onChangeText={setDetails} multiline placeholder="Anything that helps moderators" />
        {owner && <Card padded={false}><ToggleRow icon="ban-outline" title={`Also block @${userById[owner]?.username}`} value={blockToo} onChange={setBlockToo} /></Card>}
        <Button title="Submit report" variant="danger" disabled={!reason} onPress={submit} />
      </View>
    </Screen>
  );
}
