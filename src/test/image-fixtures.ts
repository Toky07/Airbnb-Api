export const JPEG_FIXTURE = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
]);

export function jpegBuffer(label = 'img'): Buffer {
  return Buffer.concat([JPEG_FIXTURE, Buffer.from(label)]);
}

export function pdfBuffer(label = 'pdf'): Buffer {
  return Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.from(label)]);
}
