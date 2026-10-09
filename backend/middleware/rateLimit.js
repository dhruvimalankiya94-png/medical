const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

/**
 * Rate limiters are keyed by IP. Under test every request comes from loopback,
 * so leaving them active would make one suite's requests exhaust the budget and
 * fail unrelated tests depending on execution order.
 *
 * They are therefore bypassed when NODE_ENV is 'test', unless a test explicitly
 * opts back in by setting ENABLE_RATE_LIMITS='true'. The check happens per
 * request rather than at module load, so a suite can switch it on and off.
 */
const bypassableInTests = (limiter) => {
  const wrapped = (req, res, next) => {
    if (process.env.NODE_ENV === 'test' && process.env.ENABLE_RATE_LIMITS !== 'true') {
      return next();
    }
    return limiter(req, res, next);
  };
  // Keep resetKey reachable so a test can clear counters between cases.
  wrapped.resetKey = (key) => limiter.resetKey(key);
  return wrapped;
};

/**
 * Unauthenticated credential endpoints: login, register, forgot-password and
 * reset-password. These are the brute-force surface, so the budget is small.
 * All four deliberately share one counter.
 */
const authLimiter = bypassableInTests(
  rateLimit({
    windowMs: WINDOW_MS,
    max: 10,
    message: { message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Password-guessing endpoints that require a valid session (change-password,
 * account deletion). They still need throttling because both accept the current
 * password, but they get their own counter so that using them cannot lock the
 * user out of logging in.
 */
const sensitiveActionLimiter = bypassableInTests(
  rateLimit({
    windowMs: WINDOW_MS,
    max: 10,
    message: { message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Global ceiling for every /api route. Raised from the original 100 because a
 * single dashboard load now issues several parallel requests (stats, records and
 * alerts), and a user navigating normally was able to exhaust the old budget.
 */
const apiLimiter = bypassableInTests(
  rateLimit({
    windowMs: WINDOW_MS,
    max: 300,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

module.exports = { authLimiter, sensitiveActionLimiter, apiLimiter, WINDOW_MS };
