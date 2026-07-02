import type { CreateRoleDto } from '../../application/dto/create-role.dto';

export class CreateRoleCommand {
  constructor(public readonly dto: CreateRoleDto) {}
}
