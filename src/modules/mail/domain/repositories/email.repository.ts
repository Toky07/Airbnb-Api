import type {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { Email } from '../entities/email.entity';

export const EMAIL_REPOSITORY = 'EMAIL_REPOSITORY';

export interface IEmailRepository {
  create(email: Email): Promise<Email>;
  update(email: Email): Promise<Email>;
  findById(id: number): Promise<Email | null>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<Email>>;
}
