import type { CreateUserDto } from '@src/modules/user/domain/dtos/createUser.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
