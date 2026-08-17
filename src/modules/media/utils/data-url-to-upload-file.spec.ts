import { dataUrlToUploadFile } from './data-url-to-upload-file';

describe('dataUrlToUploadFile', () => {
  it('should convert a PNG data URL to an upload file', () => {
    const buffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    const file = dataUrlToUploadFile(dataUrl);

    expect(file.mimetype).toBe('image/png');
    expect(file.originalname).toBe('avatar.png');
    expect(file.buffer.subarray(0, 8)).toEqual(buffer);
  });

  it('should throw for invalid data URL', () => {
    expect(() => dataUrlToUploadFile('not-a-data-url')).toThrow(
      'Image invalide.',
    );
  });

  it('rejects html disguised as an image data URL', () => {
    const dataUrl = `data:image/png;base64,${Buffer.from('<html></html>').toString('base64')}`;
    expect(() => dataUrlToUploadFile(dataUrl)).toThrow(
      'Seules les images JPEG, PNG ou WebP sont acceptées.',
    );
  });
});
