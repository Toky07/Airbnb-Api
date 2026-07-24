import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDynamicPricing1783920447453 implements MigrationInterface {
  name = 'AddDynamicPricing1783920447453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD "weekendPricePerNight" integer`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_rate_overrides" ("id" SERIAL NOT NULL, "roomId" integer NOT NULL, "startDate" character varying NOT NULL, "endDate" character varying NOT NULL, "pricePerNight" integer NOT NULL, "label" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_room_rate_overrides_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_room_rate_overrides_roomId" ON "room_rate_overrides" ("roomId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_rate_overrides" ADD CONSTRAINT "FK_room_rate_overrides_roomId" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room_rate_overrides" DROP CONSTRAINT "FK_room_rate_overrides_roomId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_room_rate_overrides_roomId"`);
    await queryRunner.query(`DROP TABLE "room_rate_overrides"`);
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP COLUMN "weekendPricePerNight"`,
    );
  }
}
