import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFavoritesTable1783920447455 implements MigrationInterface {
  name = 'AddFavoritesTable1783920447455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "roomId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorites_user_room" UNIQUE ("userId", "roomId")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD CONSTRAINT "FK_favorites_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD CONSTRAINT "FK_favorites_room"
      FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_room"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_favorites_user"`,
    );
    await queryRunner.query(`DROP TABLE "favorites"`);
  }
}
