import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { getThrottlerModuleOptions } from '../config/throttle.config';

@Global()
@Module({
  imports: [ThrottlerModule.forRoot(getThrottlerModuleOptions())],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}
