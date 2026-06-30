import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-algebra-gear-ratios';
import { lesson02 } from './lessons/02-trig-linkages';
import { lesson03 } from './lessons/03-vectors';
import { lesson04 } from './lessons/04-coordinate-systems';
import { lesson05 } from './lessons/05-linear-algebra';
import { lesson06 } from './lessons/06-calculus-concepts';
import { lesson07 } from './lessons/07-statistics';

export const module0: Module = {
  id: 'module-0-foundations',
  title: 'Foundations: Generic Math for Robotics',
  shortTitle: 'Foundations',
  description:
    'The math building blocks every FRC student needs — taught through robot mechanisms, not abstract textbook problems.',
  order: 0,
  color: 'blue',
  lessons: [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06, lesson07],
};
