export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
] as const;

export type DetectedImageKind = 'jpeg' | 'png' | 'webp';

const KIND_TO_EXTENSION: Record<DetectedImageKind, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
};

const KIND_TO_MIME: Record<DetectedImageKind, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function extensionForImageKind(kind: DetectedImageKind): string {
  return KIND_TO_EXTENSION[kind];
}

export function mimeForImageKind(kind: DetectedImageKind): string {
  return KIND_TO_MIME[kind];
}

export function isAllowedImageMimeType(mimetype: string | undefined): boolean {
  const normalized = mimetype?.split(';')[0]?.trim().toLowerCase() ?? '';
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(normalized);
}

export function isAllowedImageExtension(filename: string | undefined): boolean {
  const name = filename?.trim().toLowerCase() ?? '';
  const dot = name.lastIndexOf('.');
  if (dot < 0) {
    return false;
  }
  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(
    name.slice(dot),
  );
}

export function detectImageKind(buffer: Buffer): DetectedImageKind | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpeg';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    if (riff === 'RIFF' && webp === 'WEBP') {
      return 'webp';
    }
  }

  return null;
}

export function isPdfBuffer(buffer: Buffer): boolean {
  return (
    buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-'
  );
}
