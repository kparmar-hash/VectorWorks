import { Link } from 'react-router-dom';
import { CURRICULUM } from '../content/curriculum';
import { Layout } from '../components/layout/Layout';
import { CheatSheet } from '../components/lesson/CheatSheet';
import { type CheatsheetSection } from '../types/curriculum';

export function Reference() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Formula Reference</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Every formula from every lesson, organized by module. Bookmark this for pit use.
        </p>

        {CURRICULUM.modules.map((mod) => (
          <section key={mod.id} className="mb-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded">
                M{mod.order}
              </span>
              {mod.title}
            </h2>

            {mod.lessons.map((lesson) => {
              const cheatsheets = lesson.sections.filter(
                (s): s is CheatsheetSection => s.type === 'cheatsheet',
              );
              if (cheatsheets.length === 0) return null;

              return (
                <div key={lesson.id} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lesson.title}</h3>
                    <Link
                      to={`/modules/${mod.id}/${lesson.id}`}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View lesson →
                    </Link>
                  </div>
                  {cheatsheets.map((cs, i) => (
                    <CheatSheet key={i} entries={cs.entries} />
                  ))}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </Layout>
  );
}
