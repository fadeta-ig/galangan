import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

function sha256(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function safeEqual(a: string, b: string, encoding: BufferEncoding = "utf8"): boolean {
  const aBuffer = Buffer.from(a, encoding);
  const bBuffer = Buffer.from(b, encoding);

  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(SCRYPT_SALT_LENGTH).toString("base64url");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: SCRYPT_MAX_MEMORY,
  }).toString("base64url");

  return [
    SCRYPT_PREFIX,
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt,
    hash,
  ].join("$");
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");

  if (parts[0] === SCRYPT_PREFIX && parts.length === 6) {
    const [, cost, blockSize, parallelization, salt, expectedHash] = parts;
    const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
      maxmem: SCRYPT_MAX_MEMORY,
    }).toString("base64url");

    return safeEqual(derivedHash, expectedHash);
  }

  return safeEqual(sha256(password), storedHash);
}

export function needsPasswordRehash(storedHash: string): boolean {
  return !storedHash.startsWith(`${SCRYPT_PREFIX}$`);
}
