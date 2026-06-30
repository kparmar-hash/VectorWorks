export interface MotorSpec {
  id: string;
  name: string;
  stallTorqueNm: number;
  freeSpeedRPM: number;
  stallCurrentA: number;
}

export const MOTOR_SPECS: MotorSpec[] = [
  { id: 'neo',     name: 'REV NEO',     stallTorqueNm: 3.28,  freeSpeedRPM: 5676, stallCurrentA: 166 },
  { id: 'neo550',  name: 'NEO 550',     stallTorqueNm: 0.97,  freeSpeedRPM: 11000, stallCurrentA: 100 },
  { id: 'falcon',  name: 'Falcon 500',  stallTorqueNm: 4.69,  freeSpeedRPM: 6380, stallCurrentA: 257 },
  { id: 'kraken',  name: 'Kraken X60',  stallTorqueNm: 9.37,  freeSpeedRPM: 6000, stallCurrentA: 366 },
  { id: 'vortex',  name: 'NEO Vortex',  stallTorqueNm: 3.60,  freeSpeedRPM: 6784, stallCurrentA: 211 },
];

/**
 * Output shaft torque (after gearbox) at a given output RPM.
 * Curve goes from stallTorque*GR at 0 RPM to 0 at freeSpeed/GR.
 */
export function outputTorqueAtRPM(motor: MotorSpec, outputRPM: number, gearRatio: number): number {
  const freeOutputRPM = motor.freeSpeedRPM / gearRatio;
  const ratio = Math.max(0, Math.min(1, outputRPM / freeOutputRPM));
  return motor.stallTorqueNm * gearRatio * (1 - ratio);
}

/**
 * Motor current draw based on output RPM.
 * Current is the same regardless of gearbox (gearbox is lossless).
 */
export function currentAtOutputRPM(motor: MotorSpec, outputRPM: number, gearRatio: number): number {
  const freeOutputRPM = motor.freeSpeedRPM / gearRatio;
  const ratio = Math.max(0, Math.min(1, outputRPM / freeOutputRPM));
  return motor.stallCurrentA * (1 - ratio);
}

/**
 * Mechanical power at output shaft (watts).
 */
export function outputPowerW(motor: MotorSpec, outputRPM: number, gearRatio: number): number {
  const torque = outputTorqueAtRPM(motor, outputRPM, gearRatio);
  const angularVelRadS = (outputRPM * Math.PI * 2) / 60;
  return torque * angularVelRadS;
}

/**
 * Operating point: output RPM when load = loadTorqueNm.
 * Returns null if the load exceeds stall torque (mechanism can't move).
 */
export function operatingPointRPM(motor: MotorSpec, loadTorqueNm: number, gearRatio: number): number | null {
  const stallOutput = motor.stallTorqueNm * gearRatio;
  if (loadTorqueNm >= stallOutput) return null;
  const freeOutputRPM = motor.freeSpeedRPM / gearRatio;
  return freeOutputRPM * (1 - loadTorqueNm / stallOutput);
}

/**
 * Generate (outputRPM, torque) pairs for plotting the curve.
 */
export function curvePoints(motor: MotorSpec, gearRatio: number, numPoints = 60): Array<{ rpm: number; torque: number; power: number }> {
  const freeOut = motor.freeSpeedRPM / gearRatio;
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const rpm = (i / numPoints) * freeOut;
    points.push({
      rpm,
      torque: outputTorqueAtRPM(motor, rpm, gearRatio),
      power:  outputPowerW(motor, rpm, gearRatio),
    });
  }
  return points;
}
