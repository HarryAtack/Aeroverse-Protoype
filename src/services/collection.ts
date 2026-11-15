import type { CollectedAircraft } from '@/types/domain';

export function setProgress(setItems: string[], collection: CollectedAircraft[]) {
  const have = setItems.filter((id) => collection.some((c) => c.typeId === id));
  return { have, missing: setItems.filter((id) => !have.includes(id)), ratio: have.length / setItems.length };
}
