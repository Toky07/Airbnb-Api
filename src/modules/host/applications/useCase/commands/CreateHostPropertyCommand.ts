import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreatePropertyDto } from '../../../../properties/contracts';
import type { UploadFile } from '../../../../media/contracts';

export class CreateHostPropertyCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly dto: Omit<CreatePropertyDto, 'ownerId'>,
    public readonly image?: UploadFile,
  ) {}
}
