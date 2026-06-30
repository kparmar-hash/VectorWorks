import { Link } from 'react-router-dom';
import { CURRICULUM } from '../content/curriculum';
import { useProgress } from '../context/ProgressContext';

export function Home() {
  const modules = CURRICULUM.modules;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const { isComplete, totalCompleted } = useProgress();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <section className="text-center py-16">
        <div className="flex justify-center mb-4">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-brand-600" aria-hidden="true">
            <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 7H21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          The math FRC teams actually use
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          VectorWorks teaches algebra, physics, and robotics math through the mechanisms on your
          robot — gear ratios, arm torque, projectile shooters, swerve kinematics. Every concept
          has a simulation you can manipulate and a calculator you can use on the field.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/modules"
            className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Start learning
          </Link>
          <Link
            to="/simulations"
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Browse simulations
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 mb-16">
        {[
          { n: modules.length, label: 'Modules' },
          { n: totalLessons,   label: 'Lessons' },
          { n: '6+',           label: 'Interactive simulations' },
        ].map(({ n, label }) => (
          <div key={label} className="text-center p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-3xl font-bold text-brand-600">{n}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </section>

      {/* Progress banner — only when started */}
      {totalCompleted > 0 && (
        <section className="mb-8 p-4 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/30 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-1">
              Your progress — {totalCompleted} of {totalLessons} lessons complete
            </div>
            <div className="h-2 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCompleted / totalLessons) * 100)}%` }}
              />
            </div>
          </div>
          <Link
            to="/modules"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            Continue →
          </Link>
        </section>
      )}

      {/* Modules preview */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Curriculum</h2>
        <div className="space-y-4">
          {modules.map((mod) => {
            const doneCount = mod.lessons.filter((l) => isComplete(`${mod.id}/${l.id}`)).length;
            const pct = mod.lessons.length > 0 ? doneCount / mod.lessons.length : 0;
            return (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="block p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
                      Module {mod.order}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{mod.description}</p>
                    {doneCount > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1 w-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{doneCount}/{mod.lessons.length}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-sm text-slate-400 text-right">
                    <div>{mod.lessons.length} lessons</div>
                    <div className="text-brand-600 dark:text-brand-400 mt-1 group-hover:translate-x-0.5 transition-transform">→</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Attribution */}
      <section className="mt-16 p-4 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-500 text-center">
        Motor specs from CTRE official documentation. Field dimensions from FIRST game manuals.
        All explanatory content original to VectorWorks.
        <a href="https://www.thebluealliance.com" className="ml-2 text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
          Event data: The Blue Alliance API
        </a>
      </section>
    </div>
  );
}
