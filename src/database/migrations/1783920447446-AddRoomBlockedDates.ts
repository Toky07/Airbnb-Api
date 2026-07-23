import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoomBlockedDates1783920447446 implements MigrationInterface {
  name = 'AddRoomBlockedDates1783920447446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "room_blocked_dates" ("id" SERIAL NOT NULL, "roomId" integer NOT NULL, "startDate" character varying NOT NULL, "endDate" character varying NOT NULL, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_room_blocked_dates_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_room_blocked_dates_roomId" ON "room_blocked_dates" ("roomId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_blocked_dates" ADD CONSTRAINT "FK_room_blocked_dates_roomId" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room_blocked_dates" DROP CONSTRAINT "FK_room_blocked_dates_roomId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_room_blocked_dates_roomId"`);
    await queryRunner.query(`DROP TABLE "room_blocked_dates"`);
  }
}
