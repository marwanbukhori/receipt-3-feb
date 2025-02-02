import { randomUUID } from 'crypto';

// Add crypto polyfill globally
global.crypto = {
  ...global.crypto,
  randomUUID: () => randomUUID(),
} as Crypto;
