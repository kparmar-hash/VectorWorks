const G = 9.81; // m/s²

/**
 * Gravity torque on an arm about its pivot.
 * @param massKg - arm + payload mass (kg)
 * @param lengthM - distance from pivot to center of mass (m)
 * @param angleDeg - angle from horizontal (deg); 0 = horizontal, 90 = vertical up
 */
export function gravityTorqueNm(massKg: number, lengthM: number, angleDeg: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return massKg * G * lengthM * Math.cos(rad);
}

/**
 * Required motor torque (at motor shaft) to counteract gravity.
 * @param gravTorqueNm - torque at output/arm shaft (N·m)
 * @param gearRatio - reduction ratio (e.g. 40 for 40:1)
 */
export function requiredMotorTorqueNm(gravTorqueNm: number, gearRatio: number): number {
  return Math.abs(gravTorqueNm) / gearRatio;
}

/**
 * Maximum output torque the gearbox can deliver.
 * @param stallTorqueNm - motor stall torque (N·m)
 * @param gearRatio - reduction ratio
 */
export function outputTorqueCapacityNm(stallTorqueNm: number, gearRatio: number): number {
  return stallTorqueNm * gearRatio;
}

/**
 * Safety margin ratio: > 1.0 means motor can hold position.
 * @param capacityNm - available output torque (N·m)
 * @param requiredNm - required output torque (N·m)
 */
export function safetyMarginRatio(capacityNm: number, requiredNm: number): number {
  if (requiredNm < 0.001) return Infinity;
  return capacityNm / requiredNm;
}
