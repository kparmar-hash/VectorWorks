import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildSearchIndex, searchIndex, type SearchResult } from '../../search/buildIndex';

const TYPE_BADGE: Record<SearchResult['type'], { label: string; className: string }> = {
  lesson:     { label: 'L', className: 'bg-brand-600' },
  formula:    { label: 'F', className: 'bg-purple-600' },
  simulation: { label: 'S', className: 'bg-sky-600' },
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchIndex(index, query), [index, query]);

  // Focus input and reset state when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.href);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  }, [results, selectedIndex, handleSelect, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-slate-400 shrink-0" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons, formulas, simulations…"
            className="w-full py-4 text-base outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 text-lg leading-none"
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {!query ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              Start typing to search lessons, formulas, and simulations
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              No results for <span className="font-medium text-slate-600 dark:text-slate-300">"{query}"</span>
            </div>
          ) : (
            results.map((result, i) => {
              const badge = TYPE_BADGE[result.type];
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={`${result.moduleId}-${result.lessonId}-${result.type}-${result.title}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Type badge */}
                  <span
                    className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${badge.className}`}
                    aria-label={result.type}
                  >
                    {badge.label}
                  </span>

                  {/* Title + subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {result.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Module name */}
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500 hidden sm:block max-w-[120px] truncate text-right">
                    {result.moduleTitle}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
          <span className="ml-auto">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-brand-500 inline-block" /> lesson
              <span className="w-2 h-2 rounded-sm bg-purple-500 inline-block ml-2" /> formula
              <span className="w-2 h-2 rounded-sm bg-sky-500 inline-block ml-2" /> simulation
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
