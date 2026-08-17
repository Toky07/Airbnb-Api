import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import type { ThrottlerStorage } from '@nestjs/throttler';

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly store: Keyv<number>;

  constructor(redisUrl: string) {
    this.store = new Keyv<number>({
      store: new KeyvRedis(redisUrl),
      namespace: 'throttle',
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
  }> {
    const namespaced = `${throttlerName}:${key}`;
    const totalHits = Number((await this.store.get(namespaced)) ?? 0) + 1;
    const isBlocked = totalHits > limit;

    await this.store.set(namespaced, totalHits, ttl);

    return {
      totalHits,
      timeToExpire: ttl,
      isBlocked,
      timeToBlockExpire: isBlocked ? blockDuration : 0,
    };
  }
}
