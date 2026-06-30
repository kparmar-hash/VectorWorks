import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ProgressContextValue {
  completed: Set<string>;
  markComplete: (lessonKey: string) => void;
  markIncomplete: (lessonKey: string) => void;
  isComplete: (lessonKey: string) => boolean;
  totalCompleted: number;
  loading: boolean;
  syncError: boolean;
}

const ProgressContext = createContext<ProgressContextValue>({
  completed: new Set(),
  markComplete: () => {},
  markIncomplete: () => {},
  isComplete: () => false,
  totalCompleted: 0,
  loading: false,
  syncError: false,
});

/**
 * lessonKey = `moduleId/lessonId`
 * Progress lives server-side (api/progress.ts → Upstash Redis), keyed by the
 * authenticated Clerk user — never trust/store anything for signed-out users.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, userId, getToken } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setCompleted(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`GET /api/progress ${res.status}: ${await res.text().catch(() => res.statusText)}`);
        }
        const data = (await res.json()) as { completed: string[] };
        if (!cancelled) {
          setCompleted(new Set(data.completed));
          setSyncError(false);
        }
      } catch (err) {
        console.error('[progress] failed to load:', err);
        if (!cancelled) {
          setCompleted(new Set());
          setSyncError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, getToken]);

  const syncLesson = useCallback(
    async (key: string, isDone: boolean) => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lessonKey: key, completed: isDone }),
        });
        if (!res.ok) {
          throw new Error(`POST /api/progress ${res.status}: ${await res.text().catch(() => res.statusText)}`);
        }
        setSyncError(false);
      } catch (err) {
        console.error('[progress] failed to save:', err);
        setSyncError(true);
        // Roll back the optimistic update — the server never actually saved this.
        setCompleted((prev) => {
          const next = new Set(prev);
          if (isDone) next.delete(key);
          else next.add(key);
          return next;
        });
      }
    },
    [isSignedIn, getToken],
  );

  const markComplete = useCallback(
    (key: string) => {
      setCompleted((prev) => new Set(prev).add(key));
      void syncLesson(key, true);
    },
    [syncLesson],
  );

  const markIncomplete = useCallback(
    (key: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      void syncLesson(key, false);
    },
    [syncLesson],
  );

  const isComplete = useCallback((key: string) => completed.has(key), [completed]);

  return (
    <ProgressContext.Provider
      value={{ completed, markComplete, markIncomplete, isComplete, totalCompleted: completed.size, loading, syncError }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
