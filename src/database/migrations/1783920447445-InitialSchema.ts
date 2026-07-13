import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783920447445 implements MigrationInterface {
  name = 'InitialSchema1783920447445';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "key" character varying(64) NOT NULL, "label" character varying(255) NOT NULL, "module" character varying(64) NOT NULL, CONSTRAINT "UQ_017943867ed5ceef9c03edd9745" UNIQUE ("key"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "slug" character varying(64) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_881f72bac969d9a00a1a29e1079" UNIQUE ("slug"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "avatar" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "authId" integer, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_types" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "slug" character varying(120) NOT NULL, "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_20180102ff8f034e54c5812f695" UNIQUE ("name"), CONSTRAINT "UQ_e79afa8f05e3bfc95b8034e1e8f" UNIQUE ("slug"), CONSTRAINT "PK_b6e1d0a9b67d4b9fbff9c35ab69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying, "description" character varying NOT NULL, "pricePerNight" integer NOT NULL, "maxGuests" integer NOT NULL, "bedrooms" integer NOT NULL, "bathrooms" integer NOT NULL, "beds" integer NOT NULL, "quantity" integer NOT NULL, "size" integer NOT NULL, "status" character varying NOT NULL, "roomTypeId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "propertyId" integer, CONSTRAINT "UQ_4a252a005ce573079b47a4f38e3" UNIQUE ("slug"), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "property_types" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "slug" character varying(120) NOT NULL, "sortOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3f23c3f28ed3e1a4b9d7f2ffa20" UNIQUE ("name"), CONSTRAINT "UQ_e1d826d0f51f07313f77e3e294a" UNIQUE ("slug"), CONSTRAINT "PK_129390b286b9c776438dfa475a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "properties" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "country" character varying NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "checkInTime" character varying NOT NULL, "checkOutTime" character varying NOT NULL, "ownerId" integer NOT NULL, "propertyTypeId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" SERIAL NOT NULL, "path" character varying NOT NULL, "type" character varying NOT NULL, "entityType" character varying NOT NULL, "entityId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "emails" ("id" SERIAL NOT NULL, "to" text NOT NULL, "cc" text NOT NULL DEFAULT '[]', "bcc" text NOT NULL DEFAULT '[]', "subject" character varying NOT NULL, "body" text NOT NULL, "isHtml" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'pending', "errorMessage" text, "sentAt" TIMESTAMP, "sourceModule" character varying, "sentByAuthId" integer, "attachments" text NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a54dcebef8d05dca7e839749571" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "password_setup_tokens" ("id" SERIAL NOT NULL, "authId" integer NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "consumedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0e1c70fc5212d9139d13e4f5711" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "amount" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'eur', "status" character varying NOT NULL DEFAULT 'pending', "provider" character varying NOT NULL DEFAULT 'stripe', "transactionId" character varying NOT NULL, "cartId" integer, "userId" integer NOT NULL, "propertyType" character varying NOT NULL, "propertyId" integer NOT NULL, "errorMessage" text, "invoiceNotificationsSentAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c39d78e8744809ece8ca95730e2" UNIQUE ("transactionId"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservation_items" ("id" SERIAL NOT NULL, "reservationId" integer NOT NULL, "roomId" integer NOT NULL, "checkIn" character varying NOT NULL, "checkOut" character varying NOT NULL, "guestCount" integer NOT NULL, "price" real NOT NULL, "nights" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bfc06fb7312bf99dd93bbe73844" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "paymentId" integer, CONSTRAINT "REL_f8dbec76216ec5e4ef78cdecbc" UNIQUE ("paymentId"), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "itemType" character varying NOT NULL, "label" character varying NOT NULL, "unitPrice" real NOT NULL, "totalPrice" real NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "propertyId" integer, "roomId" integer, "serviceId" integer, "startDate" character varying, "endDate" character varying, "guestCount" integer, "nights" integer, "cartId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" SERIAL NOT NULL, "sessionId" character varying NOT NULL, "userId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_08c5fb75dc0c2ed434aac2b0f5e" UNIQUE ("sessionId"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "amenities" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "icon" character varying(80) NOT NULL, "scope" character varying(20) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f7445d30005b76efe1f93a871b5" UNIQUE ("name", "scope"), CONSTRAINT "PK_c0777308847b3556086f2fb233e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "property_amenities" ("propertyId" integer NOT NULL, "amenityId" integer NOT NULL, CONSTRAINT "PK_3e12800a5320e00a6c52e5d3208" PRIMARY KEY ("propertyId", "amenityId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_amenities" ("roomId" integer NOT NULL, "amenityId" integer NOT NULL, CONSTRAINT "PK_249afeb4cc65d5fc4537c5fda78" PRIMARY KEY ("roomId", "amenityId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "paymentType" character varying NOT NULL, "paymentId" integer NOT NULL, "path" character varying NOT NULL, "invoiceNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fd0f0d38a4932e652480226af88" UNIQUE ("paymentType", "paymentId"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolesId" integer NOT NULL, "permissionsId" integer NOT NULL, CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions" ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions" ("permissionsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_roles" ("authId" integer NOT NULL, "rolesId" integer NOT NULL, CONSTRAINT "PK_6480addffc9568a23410d49563b" PRIMARY KEY ("authId", "rolesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4258f5fcd17bffa031f98dae84" ON "auth_roles" ("authId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d3771f16b51a9a1d2be3b6fcb" ON "auth_roles" ("rolesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_f8ecddfc60e9d1c2719ab17fe6a" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_ce3e5c454b2ff702244f7318828" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_76b20e23154532d6fc4a0f0ea27" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD CONSTRAINT "FK_3e26ce84675ec56ba2e81f9a8bb" FOREIGN KEY ("propertyTypeId") REFERENCES "property_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_setup_tokens" ADD CONSTRAINT "FK_f1d88a7c503b2ef18850853b222" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_items" ADD CONSTRAINT "FK_47258d2fccc530c4da433a09722" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_f8dbec76216ec5e4ef78cdecbcf" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_amenities" ADD CONSTRAINT "FK_bd6554008f7afab61289b8df282" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_amenities" ADD CONSTRAINT "FK_5a893424c184f20f75148980e32" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_amenities" ADD CONSTRAINT "FK_19e2338246643324027e4f57d06" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_amenities" ADD CONSTRAINT "FK_e8cd72008eb4f6874402f61c6c4" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_roles" ADD CONSTRAINT "FK_4258f5fcd17bffa031f98dae84d" FOREIGN KEY ("authId") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_roles" ADD CONSTRAINT "FK_3d3771f16b51a9a1d2be3b6fcb3" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_roles" DROP CONSTRAINT "FK_3d3771f16b51a9a1d2be3b6fcb3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_roles" DROP CONSTRAINT "FK_4258f5fcd17bffa031f98dae84d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_amenities" DROP CONSTRAINT "FK_e8cd72008eb4f6874402f61c6c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_amenities" DROP CONSTRAINT "FK_19e2338246643324027e4f57d06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_amenities" DROP CONSTRAINT "FK_5a893424c184f20f75148980e32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "property_amenities" DROP CONSTRAINT "FK_bd6554008f7afab61289b8df282"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_f8dbec76216ec5e4ef78cdecbcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_items" DROP CONSTRAINT "FK_47258d2fccc530c4da433a09722"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_setup_tokens" DROP CONSTRAINT "FK_f1d88a7c503b2ef18850853b222"`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" DROP CONSTRAINT "FK_3e26ce84675ec56ba2e81f9a8bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_76b20e23154532d6fc4a0f0ea27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_ce3e5c454b2ff702244f7318828"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_f8ecddfc60e9d1c2719ab17fe6a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d3771f16b51a9a1d2be3b6fcb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4258f5fcd17bffa031f98dae84"`,
    );
    await queryRunner.query(`DROP TABLE "auth_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d422dabc78ff74a8dab6583da0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cb93c5877d37e954e2aa59e52"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "room_amenities"`);
    await queryRunner.query(`DROP TABLE "property_amenities"`);
    await queryRunner.query(`DROP TABLE "amenities"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "reservation_items"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "password_setup_tokens"`);
    await queryRunner.query(`DROP TABLE "emails"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "properties"`);
    await queryRunner.query(`DROP TABLE "property_types"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "room_types"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "auth"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
