import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-drivetrain-gear-ratios';
import { lesson02 } from './lessons/02-top-speed-acceleration';
import { lesson03 } from './lessons/03-traction-limits';
import { lesson04 } from './lessons/04-odometry';
import { lesson05 } from './lessons/05-swerve-kinematics';
import { lesson06 } from './lessons/06-chain-belt-drive';

export const module2: Module = {
  id: 'module-2-drivetrains',
  title: 'Drivetrains',
  shortTitle: 'Drivetrains',
  description:
    'Gear ratios, top speed, traction limits, odometry, swerve kinematics, and chain/belt drive — the math behind moving your robot.',
  order: 2,
  color: 'orange',
  lessons: [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06],
};
