import { type MotorSpec } from '../types/motor';

// DC motor physics — all functions are pure with no side effects.
// The motor torque-speed curve is linear: T = T_stall * (1 - ω/ω_free)

export function torqueAtSpeedNm(motor: MotorSpec, motorRPM: number): number {
  const fraction = Math.max(0, Math.min(1, motorRPM / motor.freeSpeedRPM));
  return motor.stallTorqueNm * (1 - fraction);
}

export function currentAtSpeedA(motor: MotorSpec, motorRPM: number): number {
  const fraction = Math.max(0, Math.min(1, motorRPM / motor.freeSpeedRPM));
  return motor.stallCurrentA * (1 - fraction) + motor.freeCurrentA * fraction;
}

export function powerAtSpeedW(motor: MotorSpec, motorRPM: number): number {
  const omega = (motorRPM * 2 * Math.PI) / 60;
  return torqueAtSpeedNm(motor, motorRPM) * omega;
}

// Peak mechanical power occurs at half the free speed
export function peakPowerW(motor: MotorSpec): number {
  return powerAtSpeedW(motor, motor.freeSpeedRPM / 2);
}

// Generate N points along the torque-speed curve for plotting
export function torqueSpeedCurve(
  motor: MotorSpec,
  points = 50,
): { rpm: number; torqueNm: number; currentA: number; powerW: number }[] {
  return Array.from({ length: points }, (_, i) => {
    const rpm = (motor.freeSpeedRPM * i) / (points - 1);
    return {
      rpm,
      torqueNm: torqueAtSpeedNm(motor, rpm),
      currentA: currentAtSpeedA(motor, rpm),
      powerW:   powerAtSpeedW(motor, rpm),
    };
  });
}
