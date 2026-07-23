import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservationHoldUntil1783920447447 implements MigrationInterface {
  name = 'AddReservationHoldUntil1783920447447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD "holdUntil" TIMESTAMP`,
    );
    await queryRunner.query(
      `UPDATE "reservations" SET "holdUntil" = "createdAt" + interval '20 minutes' WHERE "status" = 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN "holdUntil"`,
    );
  }
}
