import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import type { Email } from '@src/modules/mail/domain/entities/email.entity';

export const EMAIL_REPOSITORY = 'EMAIL_REPOSITORY';

export interface IEmailRepository {
  create(email: Email): Promise<Email>;
  update(email: Email): Promise<Email>;
  findById(id: number): Promise<Email | null>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<Email>>;
}
