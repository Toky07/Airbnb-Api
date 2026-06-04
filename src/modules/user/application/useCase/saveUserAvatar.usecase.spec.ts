import { ENTITY_TYPE } from '../../../media/constant';
import type { ILocalStorageService } from '../../../media/services/localStorage.service';
import type { UploadFile } from '../../../media/types/upload-file';
import { SaveUserAvatarUseCase } from './saveUserAvatar.usecase';

describe('SaveUserAvatarUseCase', () => {
  const file = {
    buffer: Buffer.from('avatar'),
    originalname: 'avatar.jpg',
    mimetype: 'image/jpeg',
  } as UploadFile;

  it('should save a multipart file', async () => {
    const storage = {
      save: async () => 'uploads/users/1/avatar.jpg',
      delete: async () => undefined,
      deleteMany: async () => undefined,
    } as ILocalStorageService;

    const useCase = new SaveUserAvatarUseCase(storage);
    const path = await useCase.resolve(1, '', { file });

    expect(path).toBe('uploads/users/1/avatar.jpg');
  });

  it('should save a data URL from JSON', async () => {
    const buffer = Buffer.from('json-avatar');
    const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    let savedEntityType: string | undefined;
    const storage = {
      save: async (_uploadFile, entityType) => {
        savedEntityType = entityType;
        return 'uploads/users/2/from-json.jpg';
      },
      delete: async () => undefined,
      deleteMany: async () => undefined,
    } as ILocalStorageService;

    const useCase = new SaveUserAvatarUseCase(storage);
    const path = await useCase.resolve(2, '', { avatarFromDto: dataUrl });

    expect(savedEntityType).toBe(ENTITY_TYPE.USER);
    expect(path).toBe('uploads/users/2/from-json.jpg');
  });

  it('should keep current avatar when dto omits avatar', async () => {
    const storage = {
      save: async () => 'should-not-run',
      delete: async () => undefined,
      deleteMany: async () => undefined,
    } as ILocalStorageService;

    const useCase = new SaveUserAvatarUseCase(storage);
    const path = await useCase.resolve(3, 'uploads/users/3/old.jpg', {});

    expect(path).toBe('uploads/users/3/old.jpg');
  });

  it('should delete stored file when clearing avatar', async () => {
    let deletedPath: string | undefined;
    const storage = {
      save: async () => 'unused',
      delete: async (path: string) => {
        deletedPath = path;
      },
      deleteMany: async () => undefined,
    } as ILocalStorageService;

    const useCase = new SaveUserAvatarUseCase(storage);
    const path = await useCase.resolve(4, 'uploads/users/4/old.jpg', {
      avatarFromDto: '',
    });

    expect(deletedPath).toBe('uploads/users/4/old.jpg');
    expect(path).toBe('');
  });
});
