import katex from 'katex';

interface Variable {
  symbol: string;
  meaning: string;
  unit?: string;
}

interface FormulaBlockProps {
  label?: string;
  latex: string;
  variables?: Variable[];
  explanation?: string;
  inline?: boolean;
}

export function FormulaBlock({ label, latex, variables, explanation, inline = false }: FormulaBlockProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: !inline,
  });

  if (inline) {
    return <span className="inline-formula" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="my-6 rounded-lg border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/30 overflow-hidden">
      {label && (
        <div className="px-4 py-2 border-b border-brand-100 dark:border-brand-900 bg-brand-100 dark:bg-brand-900/50">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 dark:text-brand-300">
            {label}
          </span>
        </div>
      )}
      <div
        className="px-4 py-4 overflow-x-auto text-center dark:text-slate-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {variables && variables.length > 0 && (
        <div className="px-4 pb-4 space-y-1">
          {variables.map((v) => (
            <div key={v.symbol} className="flex items-baseline gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span
                className="font-mono min-w-[3rem] text-brand-700 dark:text-brand-300"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(v.symbol, { throwOnError: false }),
                }}
              />
              <span className="text-slate-400">—</span>
              <span>{v.meaning}</span>
              {v.unit && (
                <span className="text-slate-400 ml-auto font-mono text-xs">{v.unit}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {explanation && (
        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 border-t border-brand-100 dark:border-brand-900 pt-3 mt-1">
          {explanation}
        </div>
      )}
    </div>
  );
}

// Convenience component for inline math
export function InlineMath({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
