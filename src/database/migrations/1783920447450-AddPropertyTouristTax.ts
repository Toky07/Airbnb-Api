import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyTouristTax1783920447450 implements MigrationInterface {
  name = 'AddPropertyTouristTax1783920447450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" ADD "touristTaxPerGuestNight" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "touristTaxPerGuestNight"`,
    );
  }
}
