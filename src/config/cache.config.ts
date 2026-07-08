import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

export async function getCacheConfig(): Promise<CacheModuleOptions> {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!redisUrl) {
    return {
      ttl: Number(process.env.CACHE_TTL_MS ?? 60_000),
    };
  }

  return {
    stores: [new KeyvRedis(redisUrl)],
    ttl: Number(process.env.CACHE_TTL_MS ?? 60_000),
  };
}
