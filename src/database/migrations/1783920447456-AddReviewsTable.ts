import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewsTable1783920447456 implements MigrationInterface {
  name = 'AddReviewsTable1783920447456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "reservationId" integer NOT NULL,
        "roomId" integer NOT NULL,
        "rating" integer NOT NULL,
        "comment" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_reservation" UNIQUE ("reservationId"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_roomId" ON "reviews" ("roomId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_userId" ON "reviews" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_status" ON "reviews" ("status")
    `);
    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_reservation"
      FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_room"
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_room"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_reservation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_reviews_status"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_roomId"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
