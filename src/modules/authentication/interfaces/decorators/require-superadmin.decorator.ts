import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ONLY_KEY = 'superAdminOnly';

export const RequireSuperAdmin = () => SetMetadata(SUPER_ADMIN_ONLY_KEY, true);
