import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Chip, Input } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Screen';
import { aircraftTypes } from '@/data/catalog';
import { useApp } from '@/store/useApp';

export function CorrectionSheet({ open, onClose, sightingId }: { open: boolean; onClose: () => void; sightingId: string }) {
  const [typeId, setTypeId] = useState<string>();
  const [reg, setReg] = useState('');
  const [evidence, setEvidence] = useState('');
  const [q, setQ] = useState('');
  const list = useMemo(() => aircraftTypes.filter((t) => `${t.variant} ${t.family} ${t.icao}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8), [q]);
  const submit = () => {
    if (!typeId && !reg) return useApp.getState().showToast('Choose a type or enter a registration', 'error');
    const st = useApp.getState();
    const s = st.sightings.find((x) => x.id === sightingId);
    if (!s) return;
    st.updateSighting(sightingId, { stage: 'needs_review', corrections: [...s.corrections, { typeId, registration: reg ? reg.toUpperCase() : undefined, evidence, at: new Date().toISOString() }] });
    st.showToast('Correction submitted for community review');
    onClose();
  };
  return (
    <Sheet visible={open} onClose={onClose} title="Suggest a correction">
      <View style={{ gap: space.md }}>
        <T v="small" muted>Corrections go to the community review queue with your evidence. Trusted reviewers confirm or reject them.</T>
        <Input placeholder="Search aircraft type" value={q} onChangeText={setQ} icon="search" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {list.map((t) => <Chip key={t.id} small label={t.variant} active={typeId === t.id} onPress={() => setTypeId(t.id)} />)}
        </View>
        <Input label="Registration (if known)" placeholder="e.g. G-XWBD" autoCapitalize="characters" value={reg} onChangeText={setReg} icon="barcode-outline" />
        <Input label="Evidence" placeholder="e.g. Six-wheel bogies visible; reg on nose gear door in another photo" value={evidence} onChangeText={setEvidence} multiline />
        <Button title="Submit correction" onPress={submit} />
      </View>
    </Sheet>
  );
}

