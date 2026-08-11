import type { UpdateUserDto } from '@src/modules/user/domain/dtos/createUser.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class UpdateUserCommand {
  constructor(
    public readonly dto: UpdateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
