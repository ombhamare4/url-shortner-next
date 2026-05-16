import { encodeBase62Padded } from "./base62";

// Fixed-length short code in 62^7 = 3,521,614,606,208 address space.
export const SHORT_LEN = 7;
const MOD = BigInt(62) ** BigInt(SHORT_LEN);

// Multiplier MUST be coprime with MOD = 2^7 * 31^7 — i.e. odd and not
// divisible by 31. That makes the map id -> (id * MULTIPLIER) mod MOD a
// bijection over [0, MOD), so every distinct id produces a distinct code
// with no chance of collision. Picked near 0.71 * MOD so even small ids
// fill the full output range instead of clustering near zero.
const MULTIPLIER = BigInt("2500000000001");

// Obfuscate a monotonically increasing id into an unpredictable 7-char
// base-62 string. The mapping is deterministic and reversible, but
// without the multiplier an attacker cannot enumerate neighbouring codes.
export function idToShortCode(id: number | bigint): string {
  const n = typeof id === "bigint" ? id : BigInt(id);
  if (n < BigInt(0) || n >= MOD) {
    throw new Error("id out of bounds for 7-char base62 space");
  }
  const shuffled = (n * MULTIPLIER) % MOD;
  return encodeBase62Padded(shuffled, SHORT_LEN);
}
