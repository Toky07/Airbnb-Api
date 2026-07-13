import type { CreateRoleDto } from '../../applications/dto/create-role.dto';

export class CreateRoleCommand {
  constructor(public readonly dto: CreateRoleDto) {}
}
