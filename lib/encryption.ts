/**
 * AES-256 encryption utility (simulates AWS KMS in cloud architecture).
 * Used to encrypt stored aggregates at rest.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || "32-byte-key-for-aes-256-encryption!!";
  if (secret.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  }
  return Buffer.from(secret.slice(0, 32), "utf8");
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * Returns hex string: salt + iv + tag + ciphertext.
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

/**
 * Decrypt ciphertext produced by encrypt().
 */
export function decrypt(hex: string): string {
  const key = getKey();
  const buf = Buffer.from(hex, "hex");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}
