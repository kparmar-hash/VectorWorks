import { type ReactNode } from 'react';

export type SectionType =
  | 'prose'
  | 'formula'
  | 'worked-example'
  | 'simulation'
  | 'calculator'
  | 'callout'
  | 'cheatsheet'
  | 'quiz';

export interface ProseSection {
  type: 'prose';
  content: ReactNode;
}

export interface FormulaSection {
  type: 'formula';
  label: string;
  latex: string;
  variables?: { symbol: string; meaning: string; unit?: string }[];
  explanation?: string;
}

export interface WorkedStep {
  label: string;
  latex?: string;
  explanation: ReactNode;
}

export interface WorkedExampleSection {
  type: 'worked-example';
  title: string;
  problem: ReactNode;
  steps: WorkedStep[];
  answer: ReactNode;
}

export interface SimulationSection {
  type: 'simulation';
  componentKey: string;
  title: string;
  description?: string;
}

export interface CalloutSection {
  type: 'callout';
  variant: 'tip' | 'warning' | 'frc-connection' | 'deeper-dive';
  title?: string;
  content: ReactNode;
}

export interface CheatsheetSection {
  type: 'cheatsheet';
  entries: { label: string; latex: string; note?: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSection {
  type: 'quiz';
  questions: QuizQuestion[];
}

export type LessonSection =
  | ProseSection
  | FormulaSection
  | WorkedExampleSection
  | SimulationSection
  | CalloutSection
  | CheatsheetSection
  | QuizSection;

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  estimatedMinutes: number;
  tags: string[];
  sections: LessonSection[];
}

export interface Module {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  order: number;
  color: string;
  lessons: Lesson[];
}

export interface Curriculum {
  modules: Module[];
}
