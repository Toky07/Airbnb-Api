import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceSequences1783920447452 implements MigrationInterface {
  name = 'AddInvoiceSequences1783920447452';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "invoice_sequences" (
        "year" integer NOT NULL,
        "lastNumber" integer NOT NULL DEFAULT '0',
        CONSTRAINT "PK_invoice_sequences_year" PRIMARY KEY ("year")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invoice_sequences"`);
  }
}
