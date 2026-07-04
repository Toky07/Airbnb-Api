import { Module, OnModuleInit } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/authentication/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { RoomsModule } from './modules/rooms/room.module';
import { ImportModule } from './modules/import/import.module';
import { HostModule } from './modules/host/host.module';
import { MailModule } from './modules/mail/mail.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { CartModule } from './modules/cart/cart.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AmenityModule } from './modules/amenity/amenity.module';
import { getDatabaseConfig } from './config/database.config';
import { getCacheConfig } from './config/cache.config';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: getCacheConfig,
    }),
    UserModule,
    AuthModule,
    PropertiesModule,
    RoomsModule,
    ImportModule,
    HostModule,
    MailModule,
    PaymentModule,
    ReservationModule,
    CartModule,
    InvoiceModule,
    AmenityModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    console.log('Data Source has been initialized!');
  }
}
