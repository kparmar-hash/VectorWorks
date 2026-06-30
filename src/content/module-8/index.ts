import { type Module } from '../../types/curriculum';
import { lesson01 } from './lessons/01-vision-distance';

export const module8: Module = {
  id: 'module-8-vision',
  title: 'Vision & Targeting',
  shortTitle: 'Vision',
  description:
    'Camera geometry for distance estimation, tx/ty to robot pose, AprilTag homography, and auto-aim pipeline math.',
  order: 8,
  color: 'emerald',
  lessons: [lesson01],
};
