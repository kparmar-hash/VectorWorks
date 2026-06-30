import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CURRICULUM } from '../../content/curriculum';
import { streamChat, type ChatMessage } from '../../ai/nimClient';
import { AI_CONFIG } from '../../ai/config';

// ── Page context helpers ───────────────────────────────────────────────────────

function usePageContext() {
  const { pathname } = useLocation();

  // Match /modules/:moduleId/:lessonId or /modules/:moduleId
  const match = pathname.match(/\/modules\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return { label: 'VectorWorks', context: null };

  const [, moduleId, lessonId] = match;
  const mod = CURRICULUM.modules.find((m) => m.id === moduleId);
  if (!mod) return { label: 'Modules', context: null };

  if (lessonId) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return {
        label: `${mod.shortTitle} › ${lesson.title}`,
        context: `Module: "${mod.title}" — Lesson: "${lesson.title}" (${lesson.subtitle ?? ''}). Tags: ${lesson.tags?.join(', ') ?? 'none'}.`,
      };
    }
  }

  return {
    label: mod.title,
    context: `Module: "${mod.title}" — ${mod.description}`,
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="text-base font-bold mb-1 mt-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-1 mt-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-snug">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          return isBlock ? (
            <code className="block bg-black/20 dark:bg-black/40 rounded-lg px-3 py-2 my-2 text-xs font-mono overflow-x-auto whitespace-pre">
              {children}
            </code>
          ) : (
            <code className="bg-black/15 dark:bg-black/30 rounded px-1 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current opacity-70 pl-3 my-2 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-2 border-current opacity-20" />,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-current border-opacity-30 px-2 py-1 font-semibold bg-black/10 text-left">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-current border-opacity-20 px-2 py-1">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function MessageBubble({ msg }: { msg: DisplayMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5">
          V
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-br-sm whitespace-pre-wrap'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
        }`}
      >
        {isUser ? msg.content : <MarkdownContent content={msg.content} />}
        {msg.streaming && (
          <span className="inline-block w-1.5 h-4 bg-current opacity-70 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState('');
  // Key lives server-side in the /api/nim proxy — always treat as available
  const hasKey = true;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { label: pageLabel, context: pageContext } = usePageContext();

  // Track text selection on the page
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection()?.toString().trim() ?? '';
      if (sel.length > 10) setSelection(sel);
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // Keyboard shortcut: Ctrl/Cmd+Shift+A
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'a' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const injectSelection = useCallback(() => {
    if (!selection) return;
    setInput((prev) =>
      prev
        ? `${prev}\n\n> ${selection}`
        : `Regarding this text:\n> ${selection}\n\n`
    );
    setSelection('');
    inputRef.current?.focus();
  }, [selection]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: DisplayMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    // Build history for the API (exclude the still-empty assistant placeholder)
    const history: ChatMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];

    try {
      let accumulated = '';
      for await (const chunk of streamChat(history, pageContext ?? undefined)) {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }
      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, pageContext]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const noKey = !hasKey;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close VectorBot chat' : 'Open VectorBot chat (⌘⇧A)'}
        className={`fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200
          ${open
            ? 'bg-slate-700 hover:bg-slate-600 rotate-90'
            : 'bg-brand-600 hover:bg-brand-700'
          }`}
        style={{ width: 52, height: 52 }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-0 right-0 z-40 flex flex-col transition-all duration-300 ease-in-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
          w-full sm:w-[400px] sm:bottom-24 sm:right-6 sm:rounded-2xl overflow-hidden
          bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
          shadow-2xl`}
        style={{ maxHeight: 'min(600px, calc(100vh - 120px))' }}
        aria-label="VectorBot chat panel"
        role="complementary"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">V</div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white leading-none">VectorBot</div>
              <div className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{AI_CONFIG.model}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setError(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Context bar */}
        <div className="px-4 py-1.5 bg-brand-50 dark:bg-brand-950/30 border-b border-brand-100 dark:border-brand-900 shrink-0 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 shrink-0">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="text-xs text-brand-700 dark:text-brand-400 truncate">{pageLabel}</span>
        </div>

        {/* No API key warning */}
        {noKey && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 shrink-0">
            <span className="font-semibold">No API key configured.</span> Add{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_NVIDIA_NIM_API_KEY</code>{' '}
            to your <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code> file and restart the dev server.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
          {messages.length === 0 && !noKey && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ask VectorBot anything</p>
              <p className="text-xs text-slate-400 mt-1">
                Highlight text on the page, then use "Use selection" to ask about it specifically.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  'What does the gear ratio formula mean?',
                  'How do I size a motor for my arm?',
                  'Explain PID tuning in simple terms',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
              <span className="font-semibold">Error: </span>{error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selection pill */}
        {selection && (
          <div className="mx-4 mb-2 flex items-center gap-2 shrink-0">
            <button
              onClick={injectSelection}
              className="flex-1 text-left text-xs px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors truncate"
            >
              <span className="font-semibold">Use selection: </span>
              <span className="opacity-75">"{selection.slice(0, 60)}{selection.length > 60 ? '…' : ''}"</span>
            </button>
            <button
              onClick={() => setSelection('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              aria-label="Dismiss selection"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={noKey ? 'Configure API key to chat…' : 'Ask about this lesson…'}
              disabled={noKey || loading}
              className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 px-3 py-2.5 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 disabled:opacity-50 transition-colors leading-relaxed"
              style={{ maxHeight: 120, overflowY: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading || noKey}
              className="shrink-0 w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Send message"
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-center">⌘⇧A to toggle · Enter to send · Shift+Enter for newline</p>
        </div>
      </div>
    </>
  );
}
