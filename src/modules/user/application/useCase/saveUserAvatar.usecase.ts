import { Inject } from '@nestjs/common';
import { ENTITY_TYPE } from '../../../media/constant';
import {
  LOCAL_STORAGE_SERVICE,
  type ILocalStorageService,
} from '../../../media/services/localStorage.service';
import type { UploadFile } from '../../../media/types/upload-file';
import { dataUrlToUploadFile } from '../../../media/utils/data-url-to-upload-file';
import { isStoredUploadPath } from '../../../media/utils/is-stored-upload-path';

export type ResolveUserAvatarInput = {
  file?: UploadFile;
  avatarFromDto?: string;
};

export class SaveUserAvatarUseCase {
  constructor(
    @Inject(LOCAL_STORAGE_SERVICE)
    private readonly storage: ILocalStorageService,
  ) {}

  async resolve(
    userId: number,
    currentAvatar: string,
    input: ResolveUserAvatarInput,
  ): Promise<string> {
    const { file, avatarFromDto } = input;

    if (file) {
      await this.deleteStored(currentAvatar);
      return this.storage.save(file, ENTITY_TYPE.USER, userId);
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
      return this.storage.save(uploadFile, ENTITY_TYPE.USER, userId);
    }

    return avatarFromDto;
  }

  async deleteStored(avatarPath: string): Promise<void> {
    if (isStoredUploadPath(avatarPath)) {
      await this.storage.delete(avatarPath);
    }
  }
}
