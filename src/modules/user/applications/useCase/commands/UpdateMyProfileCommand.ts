import type { UpdateMyProfileDto } from '../../dto/update-my-profile.dto';
import type { UploadFile } from '../../../../media/contracts';

export class UpdateMyProfileCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: UpdateMyProfileDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
