import { type Curriculum } from '../types/curriculum';
import { module0 } from './module-0';
import { module1 } from './module-1';
import { module2 } from './module-2';
import { module3 } from './module-3';
import { module4 } from './module-4';
import { module5 } from './module-5';
import { module6 } from './module-6';
import { module7 } from './module-7';
import { module8 } from './module-8';

// Add new modules here as they are built.
export const CURRICULUM: Curriculum = {
  modules: [module0, module1, module2, module3, module4, module5, module6, module7, module8],
};

export function getModule(moduleId: string) {
  return CURRICULUM.modules.find((m) => m.id === moduleId);
}

export function getLesson(moduleId: string, lessonId: string) {
  const mod = getModule(moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}

export function getAdjacentLessons(moduleId: string, lessonId: string) {
  const mod = getModule(moduleId);
  if (!mod) return { prev: null, next: null };
  const idx = mod.lessons.findIndex((l) => l.id === lessonId);
  return {
    prev: idx > 0 ? mod.lessons[idx - 1] : null,
    next: idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null,
  };
}
