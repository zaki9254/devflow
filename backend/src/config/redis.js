const Redis = require("ioredis");

let redis = null;

try {
  redis = new Redis(process.env.REDIS_URL, {
    lazyConnect: false,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return times * 200;
    },
  });

  redis.on("connect", () => console.log("Redis connected"));
  redis.on("error", (err) => {
    console.log("Redis error (non-fatal):", err.message);
  });
} catch (err) {
  console.log("Redis unavailable, continuing without it.");
}

module.exports = redis;
