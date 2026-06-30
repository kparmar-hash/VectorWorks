import type { ReactNode } from 'react';
import { SignedIn, SignedOut, SignInButton, ClerkLoading, ClerkLoaded } from '@clerk/clerk-react';

/** Gates lesson content behind sign-in. Browsing (modules, simulations, reference) stays public. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Sign in to continue this lesson
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Create a free account to unlock lesson content and track your progress across the curriculum.
            </p>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors">
                Sign in
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
