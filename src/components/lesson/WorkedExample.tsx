import { useState, type ReactNode } from 'react';
import katex from 'katex';
import { type WorkedStep } from '../../types/curriculum';

interface WorkedExampleProps {
  title: string;
  problem: ReactNode;
  steps: WorkedStep[];
  answer: ReactNode;
}

export function WorkedExample({ title, problem, steps, answer }: WorkedExampleProps) {
  const [open, setOpen] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
      setRevealedSteps(0);
    } else {
      setOpen(false);
      setRevealedSteps(0);
    }
  };

  const showNextStep = () => {
    setRevealedSteps((n) => Math.min(n + 1, steps.length));
  };

  return (
    <div className="my-6 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-800 dark:bg-slate-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            Worked Example
          </span>
          <span className="text-slate-100 font-medium text-sm">{title}</span>
        </div>
        <button
          onClick={handleToggle}
          className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
          aria-expanded={open}
        >
          {open ? 'Hide solution' : 'Show solution'}
        </button>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Given</div>
        <div className="text-slate-800 dark:text-slate-200 leading-relaxed">{problem}</div>
      </div>

      {open && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {steps.slice(0, revealedSteps).map((step, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-900">
              <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">
                Step {i + 1} — {step.label}
              </div>
              {step.latex && (
                <div
                  className="my-2 overflow-x-auto dark:text-slate-100"
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(step.latex, {
                      throwOnError: false,
                      displayMode: true,
                    }),
                  }}
                />
              )}
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step.explanation}</div>
            </div>
          ))}

          {revealedSteps < steps.length && (
            <div className="p-4 bg-white dark:bg-slate-900">
              <button
                onClick={showNextStep}
                className="w-full py-2 rounded border-2 border-dashed border-brand-300 dark:border-brand-700 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              >
                Next step ({revealedSteps + 1}/{steps.length})
              </button>
            </div>
          )}

          {revealedSteps === steps.length && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border-t-2 border-green-400">
              <div className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-widest mb-1">
                Answer
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{answer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
