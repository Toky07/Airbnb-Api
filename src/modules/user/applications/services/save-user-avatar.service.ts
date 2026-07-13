import { ENTITY_TYPE } from '../../../media/constant';
import type { ILocalStorageService } from '../../../media/services/localStorage.service';
import type { UploadFile } from '../../../media/types/upload-file';
import { toSaveMediaContext } from '../../../media/utils/build-upload-path';
import { dataUrlToUploadFile } from '../../../media/utils/data-url-to-upload-file';
import { isStoredUploadPath } from '../../../media/utils/is-stored-upload-path';

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

    return avatarFromDto;
  }

  async deleteStored(avatarPath: string): Promise<void> {
    if (isStoredUploadPath(avatarPath)) {
      await this.storage.delete(avatarPath);
    }
  }
}
