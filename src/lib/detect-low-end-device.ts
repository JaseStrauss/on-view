/** Heuristic for skipping heavy 3D on constrained devices. */
export function detectLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency ?? 8;
  if (cores <= 2) return true;

  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (memory !== undefined && memory <= 4) return true;

  return false;
}
