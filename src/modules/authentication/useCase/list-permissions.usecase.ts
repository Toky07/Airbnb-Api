import { Injectable } from '@nestjs/common';
import { PERMISSION_DEFINITIONS } from '../domain/constants/permissions.constant';
import { PermissionOutput } from '../application/dto/permission.output';

@Injectable()
export class ListPermissionsUseCase {
  execute(): PermissionOutput[] {
    return PERMISSION_DEFINITIONS.map(
      (p) => new PermissionOutput(p.key, p.label, p.module),
    );
  }
}
