import type {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY';

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  findByTransactionId(transactionId: string): Promise<Payment | null>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<Payment>>;
}
