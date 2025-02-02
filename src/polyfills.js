const { randomUUID } = require('crypto');

if (!global.crypto) {
  global.crypto = {
    randomUUID: () => randomUUID(),
  };
}
