import type { CreateRoleDto } from '@src/modules/authentication/applications/dto/create-role.dto';

export class CreateRoleCommand {
  constructor(public readonly dto: CreateRoleDto) {}
}
