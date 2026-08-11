import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { CreatePropertyDto } from '@src/modules/properties/contracts';
import type { UploadFile } from '@src/modules/media/contracts';

export class CreateHostPropertyCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly dto: Omit<CreatePropertyDto, 'ownerId'>,
    public readonly image?: UploadFile,
  ) {}
}
