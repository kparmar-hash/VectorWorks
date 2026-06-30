// Re-exports and derived helpers specific to the gear ratio simulation.
// All heavy lifting lives in src/physics/drivetrains.ts.

export {
  topSpeedMps,
  maxMotorForceN,
  maxTractionForceN,
  effectiveMaxForceN,
  maxAccelMps2,
  isTractionLimited,
  traversalTimeS,
  positionAtTimeM,
  motorRpmAtSpeed,
  type DrivetrainParams,
} from '../../physics/drivetrains';

export { torqueAtSpeedNm, currentAtSpeedA, torqueSpeedCurve } from '../../physics/motors';

export { mToFt, mpsToFps, inToM, lbsToKg, round } from '../../physics/units';

// Half-field traversal distance used in the animation (27 ft ≈ 8.23 m)
export const FIELD_DISTANCE_M = 8.2296;
export const FIELD_DISTANCE_FT = 27;
