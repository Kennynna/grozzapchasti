import sharp from 'sharp';
import {
  IMAGE_FULL_MAX_PX,
  IMAGE_THUMB_MAX_PX,
  IMAGE_THUMB_QUALITY,
  IMAGE_WEBP_QUALITY,
} from './uploads.constants';

export type OptimizedRaster = {
  full: Buffer;
  thumb: Buffer;
};

async function toWebp(buffer: Buffer, maxPx: number, quality: number) {
  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize(maxPx, maxPx, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

export async function rasterToWebp(buffer: Buffer): Promise<OptimizedRaster> {
  const [full, thumb] = await Promise.all([
    toWebp(buffer, IMAGE_FULL_MAX_PX, IMAGE_WEBP_QUALITY),
    toWebp(buffer, IMAGE_THUMB_MAX_PX, IMAGE_THUMB_QUALITY),
  ]);
  return { full, thumb };
}

export function thumbSiblingPath(path: string) {
  return path.replace(/\.[^.]+$/, '.thumb.webp');
}
