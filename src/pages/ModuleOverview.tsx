import { Link, useParams, Navigate } from 'react-router-dom';
import { getModule } from '../content/curriculum';
import { Layout } from '../components/layout/Layout';
import { useProgress } from '../context/ProgressContext';

export function ModuleOverview() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = getModule(moduleId!);
  const { isComplete } = useProgress();

  if (!mod) return <Navigate to="/modules" replace />;

  const doneCount = mod.lessons.filter((l) => isComplete(`${mod.id}/${l.id}`)).length;
  const totalMinutes = mod.lessons.reduce((a, l) => a + l.estimatedMinutes, 0);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <Link to="/modules" className="hover:text-brand-600 dark:hover:text-brand-400">Modules</Link>
          <span aria-hidden="true">›</span>
          <span className="text-slate-800 dark:text-slate-200">{mod.shortTitle}</span>
        </nav>

        <header className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Module {mod.order}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{mod.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{mod.description}</p>

          {doneCount > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 max-w-xs h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${(doneCount / mod.lessons.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{doneCount} of {mod.lessons.length} lessons complete</span>
            </div>
          )}
        </header>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {mod.lessons.length} lessons · ~{totalMinutes} min total
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {mod.lessons.map((lesson) => {
              const done = isComplete(`${mod.id}/${lesson.id}`);
              return (
                <li key={lesson.id}>
                  <Link
                    to={`/modules/${mod.id}/${lesson.id}`}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      done
                        ? 'bg-brand-500 text-white'
                        : 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                    }`}>
                      {done ? '✓' : lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400 ${done ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {lesson.title}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{lesson.subtitle}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {lesson.tags.map((tag) => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0 mt-1">{lesson.estimatedMinutes} min</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to={`/modules/${mod.id}/${mod.lessons[0].id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            {doneCount > 0 ? 'Continue →' : 'Start Lesson 1 →'}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
