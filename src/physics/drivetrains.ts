import { type MotorSpec } from '../types/motor';
import { G } from './units';

export interface DrivetrainParams {
  motor: MotorSpec;
  motorCount: number;        // total drive motors (typ. 4 or 6)
  gearRatio: number;         // output turns per motor turn (higher = more torque)
  wheelDiameterM: number;
  robotMassKg: number;
  frictionCoeff: number;     // μ on carpet, ~0.8 for Colson/Stealth wheels
}

// Wheel surface speed at motor free speed
export function topSpeedMps(p: DrivetrainParams): number {
  const wheelCircM = Math.PI * p.wheelDiameterM;
  const wheelRPM   = p.motor.freeSpeedRPM / p.gearRatio;
  return (wheelRPM / 60) * wheelCircM;
}

// Max force the motors can push with (ignoring traction)
export function maxMotorForceN(p: DrivetrainParams): number {
  const torquePerMotor  = p.motor.stallTorqueNm;
  const torqueAtWheels  = torquePerMotor * p.gearRatio * p.motorCount;
  return torqueAtWheels / (p.wheelDiameterM / 2);
}

// Max force before wheels slip
export function maxTractionForceN(p: DrivetrainParams): number {
  return p.frictionCoeff * p.robotMassKg * G;
}

export function isTractionLimited(p: DrivetrainParams): boolean {
  return maxMotorForceN(p) > maxTractionForceN(p);
}

export function effectiveMaxForceN(p: DrivetrainParams): number {
  return Math.min(maxMotorForceN(p), maxTractionForceN(p));
}

export function maxAccelMps2(p: DrivetrainParams): number {
  return effectiveMaxForceN(p) / p.robotMassKg;
}

// Time for robot to travel distanceM from a standing start
export function traversalTimeS(p: DrivetrainParams, distanceM: number): number {
  const v = topSpeedMps(p);
  const a = maxAccelMps2(p);
  const t1 = v / a;            // time to reach top speed
  const d1 = 0.5 * a * t1 * t1; // distance during acceleration phase

  if (d1 >= distanceM) {
    // Never reaches top speed within the distance
    return Math.sqrt((2 * distanceM) / a);
  }
  return t1 + (distanceM - d1) / v;
}

// Robot's x position (meters) at time t seconds after start
export function positionAtTimeM(p: DrivetrainParams, t: number): number {
  const v  = topSpeedMps(p);
  const a  = maxAccelMps2(p);
  const t1 = v / a;
  if (t <= t1) {
    return 0.5 * a * t * t;
  }
  const d1 = 0.5 * a * t1 * t1;
  return d1 + v * (t - t1);
}

// Motor operating RPM when robot is at given linear speed (m/s)
export function motorRpmAtSpeed(p: DrivetrainParams, linearSpeedMps: number): number {
  const wheelCircM = Math.PI * p.wheelDiameterM;
  const wheelRPS   = linearSpeedMps / wheelCircM;
  return wheelRPS * 60 * p.gearRatio;
}
