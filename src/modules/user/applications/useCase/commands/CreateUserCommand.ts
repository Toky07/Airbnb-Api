import type { CreateUserDto } from '../../../domain/dtos/createUser.dto';
import type { UploadFile } from '../../../../media/contracts';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly avatarFile?: UploadFile,
  ) {}
}
