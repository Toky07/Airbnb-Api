import type { UpdateUserDto } from '../../../domain/dtos/createUser.dto';
import type { UploadFile } from '../../../../media/types/upload-file';

export class UpdateUserCommand {
  constructor(
    public readonly dto: UpdateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
