import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getThrottlerModuleOptions } from '@src/config/throttle.config';

@Global()
@Module({
  imports: [ThrottlerModule.forRoot(getThrottlerModuleOptions())],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}
