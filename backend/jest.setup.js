import 'dotenv/config';

// Fallback test secrets — overridden by a real .env file if present
process.env.JWT_SECRET ??= 'test-secret-min-32-chars-for-jest-only-not-production';
process.env.NODE_ENV   ??= 'test';
