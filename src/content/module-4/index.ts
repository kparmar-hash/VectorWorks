import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-elevator-kinematics';
import { lesson02 } from './lessons/02-elevator-gear-ratio';
import { lesson03 } from './lessons/03-cascade-rigging';
import { lesson04 } from './lessons/04-elevator-motor-sizing';

export const module4: Module = {
  id: 'module-4-elevators',
  title: 'Elevators & Linear Motion',
  shortTitle: 'Elevators',
  description:
    'Travel time, gear ratios, cascade rigging multipliers, and motor sizing for elevator and linear mechanisms.',
  order: 4,
  color: 'teal',
  lessons: [lesson01, lesson02, lesson03, lesson04],
};
