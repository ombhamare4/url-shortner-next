const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ZERO = BigInt(0);
const BASE = BigInt(62);

export function encodeBase62(value: number | bigint): string {
  let n = typeof value === "bigint" ? value : BigInt(value);
  if (n < ZERO) throw new Error("encodeBase62 requires a non-negative value");
  if (n === ZERO) return ALPHABET[0];

  const chars: string[] = [];
  while (n > ZERO) {
    chars.push(ALPHABET[Number(n % BASE)]);
    n = n / BASE;
  }
  return chars.reverse().join("");
}

export function decodeBase62(str: string): bigint {
  let result = ZERO;
  for (const c of str) {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) throw new Error(`Invalid base62 character: ${c}`);
    result = result * BASE + BigInt(idx);
  }
  return result;
}

export function encodeBase62Padded(
  value: number | bigint,
  length: number,
): string {
  return encodeBase62(value).padStart(length, ALPHABET[0]);
}

export function isValidShortUrl(str: string): boolean {
  if (!str) return false;
  for (const c of str) {
    if (ALPHABET.indexOf(c) === -1) return false;
  }
  return true;
}
