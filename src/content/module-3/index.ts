import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-arm-torque-gravity';
import { lesson02 } from './lessons/02-motor-gearbox-sizing';
import { lesson03 } from './lessons/03-center-of-mass';
import { lesson04 } from './lessons/04-two-stage-arms';

export const module3: Module = {
  id: 'module-3-arms',
  title: 'Arms & Pivots',
  shortTitle: 'Arms',
  description:
    'Torque from gravity, motor sizing, center of mass, and two-stage arm geometry — the math behind every pivot mechanism.',
  order: 3,
  color: 'purple',
  lessons: [lesson01, lesson02, lesson03, lesson04],
};
