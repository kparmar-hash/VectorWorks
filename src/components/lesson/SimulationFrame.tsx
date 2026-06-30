import { type ReactNode } from 'react';

interface SimulationFrameProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SimulationFrame({ title, description, children }: SimulationFrameProps) {
  return (
    <div className="my-8 rounded-xl border border-sim-border bg-sim-bg overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-sim-border flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sim-danger" />
          <div className="w-3 h-3 rounded-full bg-sim-warn" />
          <div className="w-3 h-3 rounded-full bg-sim-ok" />
        </div>
        <span className="text-slate-300 text-sm font-medium">{title}</span>
        {description && (
          <span className="text-slate-500 text-xs ml-auto hidden sm:block">{description}</span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
