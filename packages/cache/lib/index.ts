import Redis, { Redis as RedisType } from 'ioredis';

let initialized = false;

let client: RedisType | null = null;
let Config: CacheConfig = undefined;

interface CacheConfig {
  host: string;
  port: number;
  password: string;
  username: string;
  prefix: string;
  useJson: boolean;
}

function clearKey (key: string) {
  return `${Config?.prefix || 'rcktcache'}__${key}`;
}

/**
 * Used to initialize the redis client
 * This is called by any function if the redis client has not been initialzed yet.
 * @param config the configuration, defaults to environement variables or fallbacks
 */
export function initCache (config?: Partial<CacheConfig>) {
  config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    prefix: 'rcktcache',
    useJson: true,
    ...config
  }
  if (Config) config = {
    ...config,
    ...Config
  }
  else Config = config as CacheConfig;
  client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password
  });
  initialized = true;
}

function getRedisClient (): RedisType {
  if (!initialized) initCache();
  if (client) return client;
  throw new Error('Client has not been initialized');
}

export const getCacheClient = getRedisClient;

/**
 * Used to retrieve an item from the cache
 * @param key the key the item is stored under
 * @returns the value (parsed unless specified in the config) or undefined.
 */
export async function getCached (key: string): Promise<any> {
  key = clearKey(key);
  let cached = await getRedisClient().get(key);
  if (!cached) return undefined;
  if (Config.useJson) {
    try {
      cached = JSON.parse(cached);
    } catch (error) {}
  }
  return cached;
}

/**
 * Used to cache an item
 * @param key the key to cache the item under
 * @param value the item's value
 * @param expiry the item's time to live, in seconds
 * @returns the value (parsed unless specified in the config) or undefined.
 */
export async function cacheItem (key: string, value: any, expiry?: number): Promise<boolean> {
  try {
    key = clearKey(key);
    await getRedisClient().set(key, Config.useJson ? JSON.stringify(value) : value, 'ex', expiry ? expiry : 15*60);
    return true;
  } catch (error) {
    return false;
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  try {
    key = clearKey(key);
    await getRedisClient().del(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Wrapper to allow for a function to be either ran or grabbed from the redis cache
 * @param fn the function
 * @param ttl the TTL of the cache (defaults to 300s)
 * @param keyModifier the key modifier (used to build to key along with the fn's parameters)
 * @returns a promise arrow function that will either run fn or grab the known answer from the cache based on fn's args
 */
 export const CacheOrRun = <T extends Array<any>, U>(fn: (...args: T) => U|Promise<U>, ttl = 300, keyModifier = 'cache') => {
  return async (...args: T): Promise<U> => {
    const key = Buffer.from(args).join(keyModifier).toString();
    const cached = await getCached(key);
    if (cached) return cached as U;
    const answer = await fn(...args);
    await cacheItem(key, answer, ttl);
    return answer;
  }
}