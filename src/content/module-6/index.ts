import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-intake-roller-math';
import { lesson02 } from './lessons/02-pneumatics-force';
import { lesson03 } from './lessons/03-four-bar-linkage';

export const module6: Module = {
  id: 'module-6-mechanisms',
  title: 'Intakes, Pneumatics & Linkages',
  shortTitle: 'Mechanisms',
  description:
    'Surface speed for rollers, pneumatic cylinder force, and four-bar linkage geometry — the math behind your intake, deploy, and manipulator mechanisms.',
  order: 6,
  color: 'yellow',
  lessons: [lesson01, lesson02, lesson03],
};
