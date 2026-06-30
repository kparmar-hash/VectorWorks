export const G = 9.81; // m/s²

/**
 * Force required to move a linear sliding mechanism at `thetaRad` from horizontal.
 * Positive return → motor must push. Negative → gravity does the work (motor brakes).
 *
 * @param m          - mechanism mass (kg)
 * @param thetaRad   - angle from horizontal (rad); positive = upward slope
 * @param mew_s      - friction coefficient between mechanism and guide rail
 * @param a          - linear acceleration of the mechanism (m/s²)
 * @param isExtending - true = moving outward along the slope
 */
export function driveForce(
  m: number,
  thetaRad: number,
  mew_s: number,
  a: number,
  isExtending: boolean,
): number {
  const mg = m * G;
  const along   = mg * Math.sin(thetaRad);          // gravity component along slope
  const normal  = mg * Math.abs(Math.cos(thetaRad)); // normal force (always ≥ 0)
  const friction = mew_s * normal;                   // friction magnitude (always ≥ 0)
  const inertia  = m * a;

  // Extending upslope: fight gravity + friction + inertia
  // Retracting downslope: gravity helps, still fight friction + inertia
  return isExtending
    ? along + friction + inertia
    : -along + friction + inertia;
}

// ── Rotating arm physics ──────────────────────────────────────────────────────

/**
 * Gravity torque about the pivot for a uniform arm.
 * θ = 0 → arm pointing straight down (zero torque).
 * θ > 0 → arm deployed forward; gravity resists holding → positive return.
 * θ < 0 → arm stowed backward; gravity assists deployment → negative return.
 *
 * τ_gravity = m · g · (L/2) · sin(θ)
 */
export function gravityTorqueNm(
  massKg: number,
  armLengthM: number,
  thetaRad: number,
): number {
  return massKg * G * (armLengthM / 2) * Math.sin(thetaRad);
}

/**
 * Minimum motor shaft torque the motor must supply to hold/move the arm against gravity.
 * τ_motor = |τ_gravity| / (GR × η)
 */
export function motorTorqueNeededNm(
  gravTorqueNm: number,
  gearRatio: number,
  efficiency = 0.85,
): number {
  return Math.abs(gravTorqueNm) / (gearRatio * efficiency);
}

/**
 * Motor current draw given how much torque it is producing.
 * Linear interpolation between free current (at 0 torque) and stall current (at stall torque).
 */
export function motorCurrentA(
  demandTorqueNm: number,
  stallTorqueNm: number,
  stallCurrentA: number,
  freeCurrentA: number,
): number {
  const ratio = Math.min(Math.max(demandTorqueNm / stallTorqueNm, 0), 1);
  return freeCurrentA + ratio * (stallCurrentA - freeCurrentA);
}

/**
 * Roller surface speed in m/s.
 * v = (motorFreeRPM / GR / 60) × π × d
 */
export function rollerSurfaceSpeedMs(
  motorFreeRPM: number,
  gearRatio: number,
  rollerDiameterM: number,
): number {
  const rollerRPM = motorFreeRPM / gearRatio;
  return (rollerRPM / 60) * Math.PI * rollerDiameterM;
}

/**
 * Effective game-piece capture force at the roller surface.
 * F_capture = μ × F_compression
 */
export function captureForceN(compressionN: number, mu: number): number {
  return compressionN * mu;
}

/**
 * Whether the motor can hold the arm at the current angle.
 * True when motor stall output torque (through GR) ≥ gravity torque.
 */
export function canHoldAtAngle(
  gravTorqueNm: number,
  stallTorqueNm: number,
  gearRatio: number,
  efficiency = 0.85,
): boolean {
  return stallTorqueNm * gearRatio * efficiency >= Math.abs(gravTorqueNm);
}

/** Convert inches to metres */
export function inToM(inches: number): number {
  return inches * 0.0254;
}

export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
