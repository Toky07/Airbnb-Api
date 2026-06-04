import { mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { ENTITY_TYPE } from '../constant';
import { LocalStorageService } from './localStorage.service';
import type { UploadFile } from '../types/upload-file';

describe('LocalStorageService', () => {
  const service = new LocalStorageService();
  const testDir = join(process.cwd(), 'uploads', 'properties', '99999');

  afterEach(async () => {
    await rm(join(process.cwd(), 'uploads'), { recursive: true, force: true });
  });

  it('should save a file and return relative path', async () => {
    const file = {
      buffer: Buffer.from('test-image'),
      originalname: 'test.png',
      mimetype: 'image/png',
    } as UploadFile;

    const relativePath = await service.save(file, ENTITY_TYPE.PROPERTY, 42);

    expect(relativePath).toContain('uploads/properties/42/');
    expect(relativePath).toMatch(/\.png$/);

    const content = await readFile(join(process.cwd(), relativePath));
    expect(content.toString()).toBe('test-image');
  });

  it('should save a user avatar under uploads/users', async () => {
    const file = {
      buffer: Buffer.from('user-avatar'),
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
    } as UploadFile;

    const relativePath = await service.save(file, ENTITY_TYPE.USER, 7);

    expect(relativePath).toContain('uploads/users/7/');
    expect(relativePath).toMatch(/\.jpg$/);
  });

  it('should delete a saved file', async () => {
    await mkdir(testDir, { recursive: true });
    const relativePath = join('uploads', 'properties', '99999', 'to-delete.jpg');
    const absolutePath = join(process.cwd(), relativePath);
    await service.delete(relativePath);

    await expect(readFile(absolutePath)).rejects.toThrow();
  });
});
