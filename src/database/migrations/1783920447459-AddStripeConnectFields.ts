import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeConnectFields1783920447459 implements MigrationInterface {
  name = 'AddStripeConnectFields1783920447459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "stripeAccountId" character varying
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "stripeOnboardingStatus" character varying NOT NULL DEFAULT 'not_started'
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "stripeChargesEnabled" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "stripePayoutsEnabled" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_users_stripeAccountId"
      ON "users" ("stripeAccountId")
      WHERE "stripeAccountId" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD "hostUserId" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD "stripeAccountId" character varying
    `);
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD "applicationFeeAmount" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "applicationFeeAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "stripeAccountId"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "hostUserId"`);
    await queryRunner.query(`DROP INDEX "UQ_users_stripeAccountId"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "stripePayoutsEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "stripeChargesEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "stripeOnboardingStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "stripeAccountId"`,
    );
  }
}
