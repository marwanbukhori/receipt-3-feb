import { randomUUID } from 'crypto';

// Mock crypto.randomUUID if it doesn't exist
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => 'test-uuid',
  } as Crypto;
}

// Also mock for TypeORM's usage
global.crypto = {
  ...global.crypto,
  randomUUID: () => 'test-uuid',
};
