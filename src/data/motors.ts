import { type MotorLibrary } from '../types/motor';

// CTRE motor specifications
// Source: CTRE official documentation / product pages
// All values at 12V nominal. Update this file when CTRE releases new specs.

export const MOTORS: MotorLibrary = {
  'kraken-x60-foc': {
    id: 'kraken-x60-foc',
    name: 'Kraken X60 (FOC)',
    manufacturer: 'CTRE',
    freeSpeedRPM: 6000,
    stallTorqueNm: 9.37,
    stallCurrentA: 483,
    freeCurrentA: 2,
    nominalVoltageV: 12,
    massKg: 0.448,
  },
  'kraken-x60': {
    id: 'kraken-x60',
    name: 'Kraken X60',
    manufacturer: 'CTRE',
    freeSpeedRPM: 5800,
    stallTorqueNm: 7.09,
    stallCurrentA: 366,
    freeCurrentA: 2,
    nominalVoltageV: 12,
    massKg: 0.448,
  },
  'falcon-500': {
    id: 'falcon-500',
    name: 'Falcon 500',
    manufacturer: 'CTRE',
    freeSpeedRPM: 6380,
    stallTorqueNm: 4.69,
    stallCurrentA: 257,
    freeCurrentA: 1.5,
    nominalVoltageV: 12,
    massKg: 0.595,
  },
};

export const MOTOR_LIST = Object.values(MOTORS);

export const DEFAULT_MOTOR_ID = 'kraken-x60-foc';
