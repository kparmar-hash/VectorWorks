import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { SearchModal } from '../search/SearchModal';
import { ChatPanel } from '../chat/ChatPanel';

export function Layout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header onSearchOpen={openSearch} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <SearchModal open={searchOpen} onClose={closeSearch} />
      <ChatPanel />
    </div>
  );
}
