import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHostApplicationsTable1783920447458 implements MigrationInterface {
  name = 'AddHostApplicationsTable1783920447458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "host_applications" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "city" character varying(120) NOT NULL, "propertyName" character varying(180), "message" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "reviewComment" text, "reviewedByAuthId" integer, "reviewedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_host_applications_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_host_applications_userId" ON "host_applications" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_host_applications_status" ON "host_applications" ("status")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_host_applications_pending_user" ON "host_applications" ("userId") WHERE "status" = 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "host_applications" ADD CONSTRAINT "FK_host_applications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "host_applications" DROP CONSTRAINT "FK_host_applications_userId"`,
    );
    await queryRunner.query(`DROP INDEX "UQ_host_applications_pending_user"`);
    await queryRunner.query(`DROP INDEX "IDX_host_applications_status"`);
    await queryRunner.query(`DROP INDEX "IDX_host_applications_userId"`);
    await queryRunner.query(`DROP TABLE "host_applications"`);
  }
}
