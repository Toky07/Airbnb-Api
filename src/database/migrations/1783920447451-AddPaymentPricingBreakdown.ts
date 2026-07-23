import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentPricingBreakdown1783920447451 implements MigrationInterface {
  name = 'AddPaymentPricingBreakdown1783920447451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "pricingBreakdown" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "pricingBreakdown"`,
    );
  }
}
