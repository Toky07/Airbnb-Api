import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentRefundFields1783920447449 implements MigrationInterface {
  name = 'AddPaymentRefundFields1783920447449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "refundedAmount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "refundTransactionId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "refundTransactionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "refundedAmount"`,
    );
  }
}
