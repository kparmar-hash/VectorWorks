import katex from 'katex';

interface CheatSheetEntry {
  label: string;
  latex: string;
  note?: string;
}

interface CheatSheetProps {
  entries: CheatSheetEntry[];
}

export function CheatSheet({ entries }: CheatSheetProps) {
  return (
    <div className="my-6 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-700 dark:bg-slate-950 px-4 py-2 flex items-center gap-2">
        <span className="text-slate-300 text-xs font-semibold uppercase tracking-widest">
          Quick Reference
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-4 px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
            <div className="w-24 sm:w-36 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">{entry.label}</div>
            <div
              className="flex-1 overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(entry.latex, {
                  throwOnError: false,
                  displayMode: false,
                }),
              }}
            />
            {entry.note && (
              <div className="text-xs text-slate-400 dark:text-slate-500 hidden md:block shrink-0 max-w-[200px] text-right">
                {entry.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
