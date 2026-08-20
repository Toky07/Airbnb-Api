import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyArrivalGuide1783920447460 implements MigrationInterface {
  name = 'AddPropertyArrivalGuide1783920447460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD "houseRules" text
    `);
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD "checkInInstructions" text
    `);
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD "wifiName" character varying(180)
    `);
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD "wifiPassword" character varying(180)
    `);
    await queryRunner.query(`
      ALTER TABLE "properties"
      ADD "emergencyContact" character varying(180)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "emergencyContact"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "wifiPassword"`,
    );
    await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "wifiName"`);
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "checkInInstructions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP COLUMN "houseRules"`,
    );
  }
}
