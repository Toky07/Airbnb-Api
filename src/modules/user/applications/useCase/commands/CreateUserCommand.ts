import type { CreateUserDto } from '../../../domain/dtos/createUser.dto';
import type { UploadFile } from '../../../../media/types/upload-file';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
