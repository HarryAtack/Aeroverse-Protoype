import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, space } from '@/theme/tokens';
import type { VerificationStage } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, EmptyState, Input, Notice, ProgressBar, Tap } from '@/components/ui/primitives';
import { Header, Screen, Sheet } from '@/components/ui/Screen';
import { Photo, RarityBadge, SimBadge, verificationMeta } from '@/components/aviation';
import { aircraftTypes, airlineById, airportById, manufacturerById, registrationByReg, typeById, typeLabel } from '@/data/catalog';
import { THRESHOLDS } from '@/services/identification';
import { localRarity } from '@/services/rarity';
import { computeSightingXp } from '@/services/xp';
import { useApp } from '@/store/useApp';
import { CorrectionSheet } from '@/components/CorrectionSheet';
import { pct } from '@/utils/format';

const LADDER: VerificationStage[] = ['detected', 'type_identified', 'variant_identified', 'registration_identified', 'community_verified'];

export default function VerificationResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useApp((st) => st.sightings.find((x) => x.id === id));
  const [chosenType, setChosenType] = useState<string>();
  const [correction, setCorrection] = useState(false);
  const [typePicker, setTypePicker] = useState(false);

  if (!s || !s.result) return <Screen header={<Header title="Verification" />}><EmptyState icon="scan-outline" title="Sighting not found" body="It may have been deleted." action="Upload a photo" onAction={() => router.replace('/upload')} /></Screen>;
  const r = s.result;
  const stage = s.stage;
  const t = typeById[chosenType ?? s.typeId];
  const reached = (st: VerificationStage) => {
    if (stage === 'community_verified') return true;
    if (st === 'detected') return r.detection.found;
    if (st === 'type_identified') return !!r.family && r.family.confidence >= THRESHOLDS.family;
    if (st === 'variant_identified') return !!r.variant && r.variant.confidence >= THRESHOLDS.variant && !!r.family && r.family.confidence >= THRESHOLDS.family;
    if (st === 'registration_identified') return !!r.registration?.accepted && stage === 'registration_identified';
    return false;
  };
  const needsReview = stage === 'needs_review';
  const rarity = localRarity(chosenType ?? s.typeId, s.airportId, s.registration);
  const candidates = [r.variant, ...r.alternatives].filter(Boolean) as { typeId: string; confidence: number }[];

  const addToHangar = () => {
    const st = useApp.getState();
    const typeId = chosenType ?? s.typeId;
    const verifiedNow = stage === 'registration_identified' || stage === 'variant_identified' || stage === 'community_verified';
    const lines = computeSightingXp({
      collection: st.collection, typeId, airlineId: s.airlineId, registration: s.registration, airportId: s.airportId, rarity, verified: verifiedNow,
      photoScore: 0.6 + (r.variant?.confidence ?? 0.5) * 0.35, visitedAirports: Array.from(new Set(st.collection.map((c) => c.airportId))), repeatsToday: st.sightings.filter((x) => x.addedToHangar && new Date(x.createdAt).toDateString() === new Date().toDateString()).length,
    });
    const total = lines.reduce((a, l) => a + l.amount, 0);
    const created = st.upsertCollected({
      typeId, registration: s.registration, airlineId: s.airlineId, airportId: s.airportId, photoId: s.photoId ?? (s.photoUri ? `uri:${s.photoUri}` : undefined),
      verification: needsReview ? 'needs_review' : stage, rarity, bestPhotoScore: 0.6 + (r.variant?.confidence ?? 0.5) * 0.35, specialLivery: !!(s.registration && registrationByReg[s.registration]?.specialLivery),
    });
    if (needsReview) {
      st.updateSighting(s.id, { addedToHangar: true, hangarId: created.id, xpPending: total, typeId });
      st.showToast(`Added as pending review · ${total} XP held until verified`, 'info');
    } else {
      st.addXp(total, `Sighting · ${typeLabel(typeId)}${s.registration ? ` ${s.registration}` : ''}`, s.id);
      st.updateSighting(s.id, { addedToHangar: true, hangarId: created.id, xpAwarded: total, typeId });
      st.setCelebrate({ title: `${typeById[typeId]?.variant} added to your hangar`, lines, total });
    }
    if (s.shareToFeed) {
      st.addPost({
        id: `mp_${s.id}`, userId: 'me', photoId: s.photoId ?? `uri:${s.photoUri}`, typeId, registration: s.registration, airlineId: s.airlineId, airportId: s.airportId,
        location: s.locationPrecision === 'hidden' ? 'Location hidden' : airportById[s.airportId]?.name ?? '', takenAt: s.takenAt, caption: s.caption ?? '',
        verification: needsReview ? 'needs_review' : stage, likes: 0, comments: [], shares: 0,
      });
    }
    // challenge progress (demo)
    if (!needsReview) st.bumpChallenge('ch_d1', 1);
    if (typeById[typeId]?.family === 'A350') st.bumpChallenge('ch_w2', 1);
    if (s.airportId === 'EGCC') st.bumpChallenge('ch_a1', 1);
  };

  const sendToReview = () => {
    useApp.getState().updateSighting(s.id, { stage: 'needs_review' });
    useApp.getState().showToast('Sent to the community review queue', 'info');
  };

  return (
    <Screen header={<Header title="Verification result" right={<SimBadge label={r.simulated ? 'SIMULATED' : 'AI'} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
          {s.photoUri ? <Image source={{ uri: s.photoUri }} style={{ width: '100%', aspectRatio: 4 / 3 }} /> : <Photo id={s.photoId} style={{ width: '100%', aspectRatio: 4 / 3 }} />}
        </View>

        {r.simulated && <Notice title="Simulated result" text="This prototype uses a simulated identification service. Results demonstrate the workflow and are not genuine AI analysis. No identification is ever 100% certain." />}

        <Card style={{ gap: 12, borderColor: verificationMeta[stage].color + '66' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={verificationMeta[stage].icon} size={26} color={verificationMeta[stage].color} />
            <View style={{ flex: 1 }}>
              <T v="overline" color={verificationMeta[stage].color}>Status</T>
              <T v="h3">{verificationMeta[stage].label}</T>
            </View>
            <RarityBadge rarity={rarity} small />
          </View>
          <T v="small" muted>{verificationMeta[stage].description}</T>
        </Card>

        <Card style={{ gap: 12 }}>
          <T v="overline" color={colors.cyan}>Predicted aircraft</T>
          <T v="h2">{t ? `${manufacturerById[t.manufacturerId]?.name} ${t.variant}` : 'Unknown'}</T>
          <T v="small" muted>{airlineById[s.airlineId]?.name} · {airportById[s.airportId]?.name}</T>
          <ConfidenceRow label="Aircraft detection" value={r.detection.confidence} threshold={THRESHOLDS.detection} />
          {r.family && <ConfidenceRow label={`Family · ${r.family.family}`} value={r.family.confidence} threshold={THRESHOLDS.family} />}
          {r.variant && <ConfidenceRow label={`Variant · ${typeById[r.variant.typeId]?.variant}`} value={r.variant.confidence} threshold={THRESHOLDS.variant} />}
          {r.alternatives.length > 0 && (
            <View style={{ gap: 4 }}>
              <T v="caption" muted>Other possibilities</T>
              {r.alternatives.map((a) => <T key={a.typeId} v="small">• {typeLabel(a.typeId)} — {pct(a.confidence)}</T>)}
            </View>
          )}
        </Card>

        <Card style={{ gap: 10 }}>
          <T v="overline" color={colors.cyan}>Registration</T>
          {r.registration?.accepted && stage !== 'needs_review' ? (
            <>
              <T v="h2" style={{ fontFamily: fonts.display }}>{r.registration.text}</T>
              <Check ok label={`OCR confidence ${pct(r.registration.ocrConfidence)} (≥ ${pct(THRESHOLDS.ocr)})`} />
              <Check ok={r.registration.databaseMatch} label="Found in registration database" />
              <Check ok={r.registration.consistentWithType} label="Database type matches visual identification" />
              {r.context && <Check ok={r.context.supportive} neutral={!r.context.supportive} label={r.context.flightMatch ? `Supporting evidence: ${r.context.flightMatch}` : r.context.note} />}
            </>
          ) : r.registration ? (
            <>
              <T v="h3" color={colors.textMuted}>Not confirmed</T>
              <T v="small" muted>Possible reading “{r.registration.text}” — held back. {r.registration.ocrConfidence < THRESHOLDS.ocr ? `OCR confidence ${pct(r.registration.ocrConfidence)} is below the ${pct(THRESHOLDS.ocr)} threshold.` : 'The registration checks did not all pass.'} AeroVerse never marks a registration as verified from a guess.</T>
            </>
          ) : (
            <>
              <T v="h3" color={colors.textMuted}>Not identified</T>
              <T v="small" muted>No registration could be read in this photograph. That’s normal — many photos don’t show it clearly.</T>
            </>
          )}
          {s.corrections.length > 0 && <Notice icon="create-outline" color={colors.review} text={`You submitted ${s.corrections.length} correction(s). They’ll be reviewed by the community.`} />}
        </Card>

        <Card style={{ gap: 6 }}>
          <T v="overline" color={colors.cyan} style={{ marginBottom: 4 }}>Verification levels</T>
          {LADDER.map((st) => <Check key={st} ok={reached(st)} label={verificationMeta[st].label} sub={verificationMeta[st].description} />)}
          <Check ok={false} warn={needsReview} label={verificationMeta.needs_review.label} sub={needsReview ? 'This sighting is in the review queue.' : 'Not required for this sighting.'} />
        </Card>

        {r.reasons.length > 0 && (
          <Card style={{ gap: 6 }}>
            <T v="overline" color={colors.cyan}>Why this result</T>
            {r.reasons.map((x) => <T key={x} v="small" muted>• {x}</T>)}
          </Card>
        )}

        {!s.addedToHangar ? (
          <View style={{ gap: 10 }}>
            {needsReview && (
              <Card style={{ gap: 10 }}>
                <T v="title">Confirm the aircraft type</T>
                <T v="small" muted>Select what you believe it is. It will be added as “pending review” and XP is held until the community verifies it.</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {candidates.map((c) => <Chip key={c.typeId} label={typeById[c.typeId]?.variant ?? c.typeId} active={(chosenType ?? s.typeId) === c.typeId} onPress={() => setChosenType(c.typeId)} />)}
                  <Chip icon="search" label="Other type…" onPress={() => setTypePicker(true)} />
                </View>
              </Card>
            )}
            <Button title={needsReview ? 'Add to hangar (pending review)' : 'Confirm & add to hangar'} icon="add-circle-outline" onPress={addToHangar} />
            <Button title="Suggest a correction" icon="create-outline" variant="secondary" onPress={() => setCorrection(true)} />
            {!needsReview && <Button title="Request human review instead" variant="ghost" onPress={sendToReview} />}
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Notice icon="checkmark-circle" color={colors.success} text={s.xpPending ? `In your hangar as pending review. ${s.xpPending} XP will be released once verified.` : `In your hangar. +${s.xpAwarded ?? 0} XP earned.`} />
            <Button title="View in hangar" icon="albums-outline" onPress={() => router.replace(`/hangar/${s.hangarId}`)} />
            <Button title="Suggest a correction" icon="create-outline" variant="secondary" onPress={() => setCorrection(true)} />
            <Button title="Go to review queue" variant="ghost" onPress={() => router.push('/review')} />
          </View>
        )}
      </View>
      <CorrectionSheet open={correction} onClose={() => setCorrection(false)} sightingId={s.id} />
      <Sheet visible={typePicker} onClose={() => setTypePicker(false)} title="Choose aircraft type">
        {aircraftTypes.map((ty) => (
          <Tap key={ty.id} onPress={() => { setChosenType(ty.id); setTypePicker(false); }} style={styles.pickRow}>
            <T v="bodyMedium" style={{ flex: 1 }}>{manufacturerById[ty.manufacturerId]?.name} {ty.variant}</T>
            {(chosenType ?? s.typeId) === ty.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
          </Tap>
        ))}
      </Sheet>
    </Screen>
  );
}

function ConfidenceRow({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const ok = value >= threshold;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T v="small">{label}</T>
        <T v="smallMedium" color={ok ? colors.success : colors.warning}>{pct(value)} {ok ? '✓' : `< ${pct(threshold)}`}</T>
      </View>
      <View>
        <ProgressBar value={value} color={ok ? colors.success : colors.warning} gradient={false} />
        <View style={{ position: 'absolute', left: `${threshold * 100}%`, top: -2, width: 2, height: 10, backgroundColor: colors.text }} />
      </View>
    </View>
  );
}

function Check({ ok, label, sub, warn, neutral }: { ok: boolean; label: string; sub?: string; warn?: boolean; neutral?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 4 }}>
      <Ionicons name={warn ? 'alert-circle' : ok ? 'checkmark-circle' : neutral ? 'remove-circle-outline' : 'ellipse-outline'} size={20} color={warn ? colors.review : ok ? colors.success : colors.textDim} />
      <View style={{ flex: 1 }}>
        <T v="bodyMedium" color={ok || warn ? colors.text : colors.textMuted}>{label}</T>
        {sub && <T v="caption" muted>{sub}</T>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
