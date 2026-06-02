import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Handle CJS export wrapper issue
const StoreClass = (RedisStore as any).default || RedisStore;
const { RedisStore: NamedRedisStore } = RedisStore as any;
const FinalStoreClass = NamedRedisStore || StoreClass;

// Redis connection - only initialize in production with connection URL
let redisClient: Redis | null = null;
const isProd = process.env.NODE_ENV === 'production';
const redisUrl = process.env.REDIS_URL;

// We only attempt to use Redis if we're in production and have a URL,
// or if we explicitly configured REDIS_URL in development.
if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null; // Don't retry indefinitely
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('error', (err) => {
      console.warn('Redis rate limiter connection error:', err.message);
      // Fallback to memory store by wiping client reference on failure
      redisClient = null;
    });
  } catch (e) {
    console.warn('Failed to initialize Redis for rate limiting:', e);
    redisClient = null;
  }
}

// Fallback to memory store if Redis is unavailable
const createLimiter = (options: { windowMs: number; max: number; message: string }) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: { error: options.message },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new FinalStoreClass({
      sendCommand: (...args: string[]) => {
        if (redisClient) {
          // ioredis call method accepts command name and arguments
          return redisClient.call(args[0], ...args.slice(1));
        }
        return Promise.reject(new Error('Redis connection lost'));
      }
    }) : undefined,
  });
};

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.'
});

export const signupLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many signup attempts. Please try again after an hour.'
});

export const forgotPasswordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many forgot password requests. Please try again after an hour.'
});

export const otpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests. Please try again after an hour.'
});

export const aiChatLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many AI chat requests. Please try again after a minute.'
});

export const doctorChatLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many doctor chat requests. Please try again after a minute.'
});

export const adminApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100, // strict rate limiting
  message: 'Too many admin API requests. Please try again later.'
});
