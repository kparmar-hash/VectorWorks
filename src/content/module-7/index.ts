import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-pid-control';
import { lesson02 } from './lessons/02-feedforward';
import { lesson03 } from './lessons/03-motion-profiling';
import { lesson04 } from './lessons/04-sensor-math';

export const module7: Module = {
  id: 'module-7-pid-controls',
  title: 'Control Theory',
  shortTitle: 'Control Theory',
  description:
    'PID feedback, feedforward voltage models, motion profiles for smooth mechanism movement, and sensor math for encoders, gyros, and filters.',
  order: 7,
  color: 'purple',
  lessons: [lesson01, lesson02, lesson03, lesson04],
};
