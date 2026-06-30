import { createContext, useContext, useState, type ReactNode } from 'react';

interface ProgressContextValue {
  completed: Set<string>;
  markComplete: (lessonKey: string) => void;
  markIncomplete: (lessonKey: string) => void;
  isComplete: (lessonKey: string) => boolean;
  totalCompleted: number;
}

const ProgressContext = createContext<ProgressContextValue>({
  completed: new Set(),
  markComplete: () => {},
  markIncomplete: () => {},
  isComplete: () => false,
  totalCompleted: 0,
});

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem('vw-progress');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem('vw-progress', JSON.stringify([...set]));
}

/** lessonKey = `moduleId/lessonId` */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);

  const markComplete = (key: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveCompleted(next);
      return next;
    });
  };

  const markIncomplete = (key: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(key);
      saveCompleted(next);
      return next;
    });
  };

  const isComplete = (key: string) => completed.has(key);

  return (
    <ProgressContext.Provider value={{ completed, markComplete, markIncomplete, isComplete, totalCompleted: completed.size }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
