import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyCancellationPolicy1783920447448 implements MigrationInterface {
  name = 'AddPropertyCancellationPolicy1783920447448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "cancellationPolicy" character varying NOT NULL DEFAULT 'moderate'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "cancellationPolicy"`,
    );
  }
}
