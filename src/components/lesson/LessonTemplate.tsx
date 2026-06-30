import { Link } from 'react-router-dom';
import { type Lesson, type Module } from '../../types/curriculum';
import { FormulaBlock } from './FormulaBlock';
import { WorkedExample } from './WorkedExample';
import { Callout } from './Callout';
import { SimulationFrame } from './SimulationFrame';
import { CheatSheet } from './CheatSheet';
import { Quiz } from './Quiz';
import { SIMULATION_REGISTRY } from '../../simulations/registry';
import { useProgress } from '../../context/ProgressContext';

interface LessonTemplateProps {
  module: Module;
  lesson: Lesson;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export function LessonTemplate({ module, lesson, prevLesson, nextLesson }: LessonTemplateProps) {
  const { isComplete, markComplete, markIncomplete } = useProgress();
  const lessonKey = `${module.id}/${lesson.id}`;
  const done = isComplete(lessonKey);

  return (
    <article className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
        <Link to="/modules" className="hover:text-brand-600 dark:hover:text-brand-400">Modules</Link>
        <span aria-hidden="true">›</span>
        <Link to={`/modules/${module.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">{module.shortTitle}</Link>
        <span aria-hidden="true">›</span>
        <span className="text-slate-800 dark:text-slate-200">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              Lesson {lesson.order} · {lesson.estimatedMinutes} min
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{lesson.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">{lesson.subtitle}</p>
          </div>

          {/* Complete toggle */}
          <button
            onClick={() => (done ? markIncomplete(lessonKey) : markComplete(lessonKey))}
            className={`shrink-0 mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              done
                ? 'bg-brand-500 text-white border-brand-500 hover:bg-brand-600 hover:border-brand-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'
            }`}
            aria-pressed={done}
          >
            <span aria-hidden="true">{done ? '✓' : '○'}</span>
            {done ? 'Completed' : 'Mark complete'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-2">
        {lesson.sections.map((section, i) => {
          switch (section.type) {
            case 'prose':
              return (
                <div key={i} className="space-y-4 text-slate-700 dark:text-slate-300">
                  {section.content}
                </div>
              );

            case 'formula':
              return (
                <FormulaBlock
                  key={i}
                  label={section.label}
                  latex={section.latex}
                  variables={section.variables}
                  explanation={section.explanation}
                />
              );

            case 'worked-example':
              return (
                <WorkedExample
                  key={i}
                  title={section.title}
                  problem={section.problem}
                  steps={section.steps}
                  answer={section.answer}
                />
              );

            case 'callout':
              return (
                <Callout key={i} variant={section.variant} title={section.title}>
                  {section.content}
                </Callout>
              );

            case 'simulation': {
              const SimComponent = SIMULATION_REGISTRY[section.componentKey];
              if (!SimComponent) {
                return (
                  <div key={i} className="my-6 p-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-sm">
                    Simulation "{section.componentKey}" coming soon
                  </div>
                );
              }
              return (
                <SimulationFrame key={i} title={section.title} description={section.description}>
                  <SimComponent />
                </SimulationFrame>
              );
            }

            case 'cheatsheet':
              return <CheatSheet key={i} entries={section.entries} />;

            case 'quiz':
              return <Quiz key={i} questions={section.questions} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Prev / next nav */}
      <nav
        className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4"
        aria-label="Lesson navigation"
      >
        {prevLesson ? (
          <Link
            to={`/modules/${module.id}/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-400 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true">←</span>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Previous</div>
              <div className="font-medium">{prevLesson.title}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Link
            to={`/modules/${module.id}/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-400 group text-right"
          >
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Next</div>
              <div className="font-medium">{nextLesson.title}</div>
            </div>
            <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
