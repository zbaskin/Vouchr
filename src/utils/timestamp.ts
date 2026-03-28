/**
 * Returns the current time as a Unix epoch timestamp in SECONDS.
 *
 * AWSTimestamp scalars in AWS AppSync / DynamoDB expect whole-number
 * seconds (Int), NOT milliseconds. Using Date.now() directly (which
 * returns milliseconds) would cause a schema validation error.
 *
 * Correct:   Math.floor(Date.now() / 1000)  → ~1.7e9  (< 2e10)
 * Incorrect: Date.now()                      → ~1.7e12 (> 1e12)
 */
export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
