import type { PhotoAsset } from '@/types/domain';
import { bundledPhotos } from './photos.generated';

export const photos = bundledPhotos;

/** Airport scenery shots fall back to another photo taken at the same airport if missing. */
const SCENERY_FALLBACK: Record<string, string> = { man: 'b738jet2', lhr: 'a350ba', ams: 'e190' };

/** User-supplied photos (uploads) are referenced as "uri:<uri>". */
export function getPhoto(id?: string): PhotoAsset | undefined {
  if (!id) return undefined;
  if (id.startsWith('uri:')) return { id, source: { uri: id.slice(4) }, author: 'You', license: 'All rights reserved' };
  return photos[id] ?? (SCENERY_FALLBACK[id] ? photos[SCENERY_FALLBACK[id]] : undefined);
}

export const allPhotoIds = Object.keys(photos);
