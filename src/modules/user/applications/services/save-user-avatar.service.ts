import {
  ENTITY_TYPE,
  dataUrlToUploadFile,
  isStoredUploadPath,
  toSaveMediaContext,
  type ILocalStorageService,
  type UploadFile,
} from '@src/modules/media/contracts';
import { BadRequestException } from '@nestjs/common';

export type ResolveUserAvatarInput = {
  file?: UploadFile;
  avatarFromDto?: string;
};

export class SaveUserAvatarService {
  constructor(private readonly storage: ILocalStorageService) {}

  async resolve(
    userId: number,
    currentAvatar: string,
    input: ResolveUserAvatarInput,
  ): Promise<string> {
    const { file, avatarFromDto } = input;
    const context = toSaveMediaContext(ENTITY_TYPE.USER, userId);

    if (file) {
      await this.deleteStored(currentAvatar);
      return this.storage.save(file, context);
    }

    if (avatarFromDto === undefined) {
      return currentAvatar;
    }

    if (avatarFromDto === '') {
      await this.deleteStored(currentAvatar);
      return '';
    }

    if (avatarFromDto.startsWith('data:')) {
      await this.deleteStored(currentAvatar);
      const uploadFile = dataUrlToUploadFile(avatarFromDto);
      return this.storage.save(uploadFile, context);
    }

    if (isStoredUploadPath(avatarFromDto) || avatarFromDto === currentAvatar) {
      return avatarFromDto;
    }

    throw new BadRequestException("URL d'avatar externe refusée.");
  }

  async deleteStored(avatarPath: string): Promise<void> {
    if (isStoredUploadPath(avatarPath)) {
      await this.storage.delete(avatarPath);
    }
  }
}
