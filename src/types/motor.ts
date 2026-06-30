export interface MotorSpec {
  id: string;
  name: string;
  manufacturer: string;
  freeSpeedRPM: number;
  stallTorqueNm: number;
  stallCurrentA: number;
  freeCurrentA: number;
  nominalVoltageV: number;
  massKg: number;
}

export interface MotorLibrary {
  [id: string]: MotorSpec;
}
