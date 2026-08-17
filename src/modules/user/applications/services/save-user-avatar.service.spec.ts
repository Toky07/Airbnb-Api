import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { SaveUserAvatarService } from './save-user-avatar.service';
import { jpegBuffer } from '@src/test/image-fixtures';

describe('SaveUserAvatarService', () => {
  it('saves uploaded file and deletes previous avatar', async () => {
    const storage = {
      save: vi.fn().mockResolvedValue('uploads/users/1/new.jpg'),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const service = new SaveUserAvatarService(storage);

    const result = await service.resolve(1, 'uploads/users/1/old.jpg', {
      file: {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      },
    });

    expect(storage.delete).toHaveBeenCalledWith('uploads/users/1/old.jpg');
    expect(storage.save).toHaveBeenCalled();
    expect(result).toBe('uploads/users/1/new.jpg');
  });

  it('keeps current avatar when no change requested', async () => {
    const storage = {
      save: vi.fn(),
      delete: vi.fn(),
    };

    const service = new SaveUserAvatarService(storage);

    const result = await service.resolve(1, 'uploads/users/1/current.jpg', {});

    expect(result).toBe('uploads/users/1/current.jpg');
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('clears avatar when empty string provided', async () => {
    const storage = {
      save: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const service = new SaveUserAvatarService(storage);

    const result = await service.resolve(1, 'uploads/users/1/old.jpg', {
      avatarFromDto: '',
    });

    expect(storage.delete).toHaveBeenCalledWith('uploads/users/1/old.jpg');
    expect(result).toBe('');
  });

  it('saves data URL avatar', async () => {
    const storage = {
      save: vi.fn().mockResolvedValue('uploads/users/1/data.jpg'),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const service = new SaveUserAvatarService(storage);

    const result = await service.resolve(1, '', {
      avatarFromDto: `data:image/jpeg;base64,${jpegBuffer('avatar').toString('base64')}`,
    });

    expect(storage.save).toHaveBeenCalled();
    expect(result).toBe('uploads/users/1/data.jpg');
  });

  it('rejects an external HTTP avatar URL', async () => {
    const storage = {
      save: vi.fn(),
      delete: vi.fn(),
    };

    const service = new SaveUserAvatarService(storage);

    await expect(
      service.resolve(1, 'uploads/users/1/current.jpg', {
        avatarFromDto: 'https://evil.example/pixel.png',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });
});
