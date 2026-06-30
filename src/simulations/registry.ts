import { type ComponentType } from 'react';
import { GearRatioExplorer } from './GearRatioExplorer';
import { ArmTorque } from './ArmTorque';
import { ProjectileShooter } from './ProjectileShooter';
import { MotorTorqueSpeed } from './MotorTorqueSpeed';
import { IntakeLoad } from './IntakeLoad';
import { PidTuning } from './PidTuning';
import { ElevatorResponse } from './ElevatorResponse';
import { SwerveKinematics } from './SwerveKinematics';

// Add new simulations here. The key matches the componentKey in lesson content.
export const SIMULATION_REGISTRY: Record<string, ComponentType> = {
  'gear-ratio-explorer': GearRatioExplorer,
  'arm-torque': ArmTorque,
  'projectile-shooter': ProjectileShooter,
  'motor-torque-speed': MotorTorqueSpeed,
  'intake-load': IntakeLoad,
  'pid-tuning': PidTuning,
  'elevator-response': ElevatorResponse,
  'swerve-kinematics': SwerveKinematics,
};
