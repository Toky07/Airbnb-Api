import type { UpdateMyProfileDto } from '@src/modules/user/applications/dto/update-my-profile.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class UpdateMyProfileCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: UpdateMyProfileDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
