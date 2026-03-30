/**
 * Differential privacy engine using Laplace mechanism.
 * Adds calibrated noise so that individual records cannot be inferred from aggregates.
 */

const SENSITIVITY = 1;

/**
 * Deterministic hash -> (0,1) float, used for reproducible demo noise.
 */
function seededUnitFloat(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const normalized = (h >>> 0) / 4294967296;
  // Avoid exact 0/1 for log safety in inverse CDF.
  return Math.min(1 - 1e-9, Math.max(1e-9, normalized));
}

/**
 * Sample from Laplace(0, scale) using inverse transform sampling.
 * Laplace CDF inverse: F^{-1}(u) = -scale * sign(u - 0.5) * ln(1 - 2|u - 0.5|)
 */
export function laplaceNoise(scale: number, seed: string): number {
  if (scale <= 0) return 0;
  const u = seededUnitFloat(seed);
  const centered = u - 0.5;
  const sign = centered >= 0 ? 1 : -1;
  return -scale * sign * Math.log(1 - 2 * Math.abs(centered));
}

/**
 * Apply Laplace noise to a value for epsilon-differential privacy.
 * noisy_value = value + Laplace(0, 1 / epsilon)
 */
export function applyNoise(value: number, epsilon: number, seed: string): number {
  if (epsilon <= 0) return value;
  const scale = SENSITIVITY / epsilon;
  const noise = laplaceNoise(scale, seed);
  const noisy = value + noise;
  return Math.round(Math.max(0, noisy));
}
