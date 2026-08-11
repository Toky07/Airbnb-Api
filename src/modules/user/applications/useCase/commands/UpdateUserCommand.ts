import type { UpdateUserDto } from '../../../domain/dtos/createUser.dto';
import type { UploadFile } from '../../../../media/contracts';

export class UpdateUserCommand {
  constructor(
    public readonly dto: UpdateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
