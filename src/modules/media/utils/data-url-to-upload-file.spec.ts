import { dataUrlToUploadFile } from './data-url-to-upload-file';

describe('dataUrlToUploadFile', () => {
  it('should convert a PNG data URL to an upload file', () => {
    const buffer = Buffer.from('avatar-bytes');
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    const file = dataUrlToUploadFile(dataUrl);

    expect(file.mimetype).toBe('image/png');
    expect(file.originalname).toBe('avatar.png');
    expect(file.buffer.toString()).toBe('avatar-bytes');
  });

  it('should throw for invalid data URL', () => {
    expect(() => dataUrlToUploadFile('not-a-data-url')).toThrow(
      'Invalid data URL',
    );
  });
});
