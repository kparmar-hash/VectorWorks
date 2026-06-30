import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import 'katex/dist/katex.min.css';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = createRoot(document.getElementById('root')!);

if (!clerkPubKey) {
  // Fail loudly but legibly — auth gates lesson content, so the app can't
  // run meaningfully without it. See .env.example for setup.
  root.render(
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Missing VITE_CLERK_PUBLISHABLE_KEY
      </h1>
      <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.5 }}>
        Sign-in is required to use VectorWorks. Copy <code>.env.example</code> to{' '}
        <code>.env</code>, add your Clerk publishable key from{' '}
        <code>dashboard.clerk.com</code>, and restart the dev server.
      </p>
    </div>,
  );
} else {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
          <ThemeProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </ThemeProvider>
        </ClerkProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}
