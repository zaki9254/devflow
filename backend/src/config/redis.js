const Redis = require("ioredis");

let redis = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: 1,
    });

    redis.on("connect", () => console.log("Redis connected"));
    redis.on("error", (err) => {
      console.log("Redis error (non-fatal):", err.message);
      redis = null;
    });
  }
} catch (e) {
  console.log("Redis unavailable");
  redis = null;
}

module.exports = redis;
