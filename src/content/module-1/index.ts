import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-kinematics';
import { lesson02 } from './lessons/02-forces-newtons-laws';
import { lesson03 } from './lessons/03-torque-statics';
import { lesson04 } from './lessons/04-work-energy-power';
import { lesson05 } from './lessons/05-rotational-ke-inertia';
import { lesson06 } from './lessons/06-electrical-basics';
import { lesson07 } from './lessons/07-dc-motor-physics';

export const module1: Module = {
  id: 'module-1-physics',
  title: 'Physics for Robotics',
  shortTitle: 'Physics',
  description:
    'Kinematics, forces, torque, energy, and the electrical physics behind every FRC motor — taught through real mechanism design decisions.',
  order: 1,
  color: 'green',
  lessons: [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07],
};
