import { Link } from 'react-router-dom';
import { CURRICULUM } from '../content/curriculum';
import { Layout } from '../components/layout/Layout';
import { useProgress } from '../context/ProgressContext';

export function Modules() {
  const { isComplete } = useProgress();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Modules</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Work through modules in order for a complete foundation, or jump to the topic your
          mechanism needs.
        </p>

        <div className="space-y-4">
          {CURRICULUM.modules.map((mod) => {
            const doneCount = mod.lessons.filter((l) => isComplete(`${mod.id}/${l.id}`)).length;
            return (
              <div key={mod.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
                        Module {mod.order}
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{mod.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{mod.description}</p>
                    </div>
                    {doneCount > 0 && (
                      <div className="shrink-0 text-right">
                        <div className="text-xs text-slate-400 dark:text-slate-500 mb-1">{doneCount}/{mod.lessons.length}</div>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${(doneCount / mod.lessons.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <ul className="divide-y divide-slate-50 dark:divide-slate-800">
                  {mod.lessons.map((lesson) => {
                    const done = isComplete(`${mod.id}/${lesson.id}`);
                    return (
                      <li key={lesson.id}>
                        <Link
                          to={`/modules/${mod.id}/${lesson.id}`}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <span className="text-xs w-6 text-center font-mono shrink-0">
                            {done ? (
                              <span className="text-brand-500" aria-label="Completed">✓</span>
                            ) : (
                              <span className="text-slate-400">{lesson.order}</span>
                            )}
                          </span>
                          <div className="flex-1">
                            <div className={`font-medium text-sm transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400 ${done ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {lesson.title}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{lesson.subtitle}</div>
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{lesson.estimatedMinutes} min</div>
                          <span className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors" aria-hidden="true">→</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
