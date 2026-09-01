const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF87A = Buffer.from('GIF87a');
const GIF89A = Buffer.from('GIF89a');
const RIFF = Buffer.from('RIFF');
const WEBP = Buffer.from('WEBP');

export function sniffImageMime(buffer: Buffer): string | undefined {
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(JPEG)) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG)) {
    return 'image/png';
  }
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).equals(GIF87A) || buffer.subarray(0, 6).equals(GIF89A))
  ) {
    return 'image/gif';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).equals(RIFF) &&
    buffer.subarray(8, 12).equals(WEBP)
  ) {
    return 'image/webp';
  }
  return undefined;
}
