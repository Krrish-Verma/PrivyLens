/**
 * Differential privacy engine using Laplace mechanism.
 * Adds calibrated noise so that individual records cannot be inferred from aggregates.
 */

const SENSITIVITY = 1;

/**
 * Sample from Laplace(0, scale) using inverse transform sampling.
 * Laplace CDF inverse: F^{-1}(u) = scale * sign(u - 0.5) * ln(1 - 2|u - 0.5|)
 */
export function laplaceNoise(scale: number): number {
  if (scale <= 0) return 0;
  const u = Math.random();
  const sign = u < 0.5 ? -1 : 1;
  const x = u < 0.5 ? u : 1 - u;
  return scale * sign * Math.log(1 - 2 * x);
}

/**
 * Apply Laplace noise to a value for epsilon-differential privacy.
 * noisy_value = value + Laplace(0, sensitivity/epsilon)
 */
export function applyNoise(value: number, epsilon: number): number {
  if (epsilon <= 0) return value;
  const scale = SENSITIVITY / epsilon;
  const noise = laplaceNoise(scale);
  const noisy = value + noise;
  return Math.round(Math.max(0, noisy));
}
