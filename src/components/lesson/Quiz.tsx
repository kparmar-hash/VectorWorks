import { useState } from 'react';
import { type QuizQuestion } from '../../types/curriculum';

interface QuizProps {
  questions: QuizQuestion[];
}

type AnswerState = number | null;

export function Quiz({ questions }: QuizProps) {
  const [answers, setAnswers] = useState<AnswerState[]>(() => Array(questions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [showSummary, setShowSummary] = useState(false);

  const q = questions[current];
  const chosen = answers[current];
  const isSubmitted = submitted[current];
  const isCorrect = chosen === q.correctIndex;
  const allAnswered = submitted.every(Boolean);
  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);

  function select(idx: number) {
    if (isSubmitted) return;
    setAnswers((prev) => { const next = [...prev]; next[current] = idx; return next; });
  }

  function submit() {
    if (chosen === null) return;
    setSubmitted((prev) => { const next = [...prev]; next[current] = true; return next; });
  }

  function goTo(idx: number) {
    setShowSummary(false);
    setCurrent(idx);
  }

  function retry() {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(Array(questions.length).fill(false));
    setShowSummary(false);
    setCurrent(0);
  }

  if (showSummary) {
    const pct = Math.round((score / questions.length) * 100);
    const allCorrect = score === questions.length;
    return (
      <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Quiz Results</span>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 text-center">
          <div className={`text-5xl font-bold mb-2 ${allCorrect ? 'text-green-500' : pct >= 66 ? 'text-brand-500' : 'text-amber-500'}`}>
            {score}/{questions.length}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {allCorrect ? 'Perfect score! You nailed it.' : pct >= 66 ? 'Good work — review the ones you missed.' : 'Re-read the lesson and try again.'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  answers[i] === questions[i].correctIndex
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={retry}
            className="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Check your understanding
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-5 bg-white dark:bg-slate-900">
        {/* Question */}
        <p className="font-medium text-slate-900 dark:text-white mb-4 leading-snug">{q.question}</p>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {q.options.map((opt, idx) => {
            let cls = 'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ';
            if (!isSubmitted) {
              cls += chosen === idx
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-slate-800';
            } else if (idx === q.correctIndex) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            } else if (idx === chosen) {
              cls += 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            } else {
              cls += 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500';
            }
            return (
              <button key={idx} onClick={() => select(idx)} className={cls} disabled={isSubmitted}>
                <span className="inline-flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                    !isSubmitted && chosen === idx ? 'border-brand-500 bg-brand-500 text-white' :
                    isSubmitted && idx === q.correctIndex ? 'border-green-500 bg-green-500 text-white' :
                    isSubmitted && idx === chosen ? 'border-red-400 bg-red-400 text-white' :
                    'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSubmitted && idx === q.correctIndex ? '✓' :
                     isSubmitted && idx === chosen && idx !== q.correctIndex ? '✗' :
                     String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isSubmitted && (
          <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'}`}>
            <span className="font-semibold mr-1">{isCorrect ? '✓ Correct.' : '✗ Not quite.'}</span>
            {q.explanation}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-brand-500' :
                  submitted[i] ? (answers[i] === questions[i].correctIndex ? 'bg-green-400' : 'bg-red-400') :
                  'bg-slate-300 dark:bg-slate-600'
                }`}
                aria-label={`Go to question ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isSubmitted ? (
              <button
                onClick={submit}
                disabled={chosen === null}
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check
              </button>
            ) : current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((n) => n + 1)}
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Next →
              </button>
            ) : allAnswered ? (
              <button
                onClick={() => setShowSummary(true)}
                className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                See results
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
