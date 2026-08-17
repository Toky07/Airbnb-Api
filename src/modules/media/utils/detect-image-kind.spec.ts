import { describe, expect, it } from 'vitest';
import {
  detectImageKind,
  isAllowedImageExtension,
  isAllowedImageMimeType,
  isPdfBuffer,
} from './detect-image-kind';

describe('detectImageKind', () => {
  it('detects jpeg, png and webp magic bytes', () => {
    expect(detectImageKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
    expect(
      detectImageKind(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
        ]),
      ),
    ).toBe('png');

    const webp = Buffer.alloc(12);
    webp.write('RIFF', 0);
    webp.write('WEBP', 8);
    expect(detectImageKind(webp)).toBe('webp');
  });

  it('rejects svg, html and short buffers', () => {
    expect(
      detectImageKind(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">')),
    ).toBeNull();
    expect(detectImageKind(Buffer.from('<html></html>'))).toBeNull();
    expect(detectImageKind(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});

describe('image allowlists', () => {
  it('accepts jpeg/png/webp mime and extensions', () => {
    expect(isAllowedImageMimeType('image/jpeg')).toBe(true);
    expect(isAllowedImageMimeType('image/png; charset=binary')).toBe(true);
    expect(isAllowedImageMimeType('image/svg+xml')).toBe(false);
    expect(isAllowedImageExtension('photo.JPG')).toBe(true);
    expect(isAllowedImageExtension('x.html')).toBe(false);
  });

  it('detects pdf magic bytes', () => {
    expect(isPdfBuffer(Buffer.from('%PDF-1.7\n'))).toBe(true);
    expect(isPdfBuffer(Buffer.from('not-pdf'))).toBe(false);
  });
});
