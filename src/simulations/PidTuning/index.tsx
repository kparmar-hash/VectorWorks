import { useState } from 'react';
import {
  simulatePid,
  settlingTime,
  overshoot,
  detectBehavior,
  type PidFrame,
} from './physics';

// ── SVG layout ────────────────────────────────────────────────────────────────

const VW = 480;
const VH = 260;
const PL = 44;
const PR = 16;
const PT = 14;
const PB = 28;
const PW = VW - PL - PR;
const PH = VH - PT - PB;

const SIM_DURATION = 3;
const Y_MAX = 210; // degrees shown

function toX(t: number): number { return PL + (t / SIM_DURATION) * PW; }
function toY(deg: number): number { return PT + PH - (Math.min(Math.max(deg, 0), Y_MAX) / Y_MAX) * PH; }

// ── Sub-components ────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step, unit, format, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; unit: string; format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-xs text-slate-400 font-medium">{label}</label>
        <span className="text-sm font-mono text-sim-accent">
          {format ? format(value) : value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-400 bg-slate-600 cursor-pointer"
        aria-label={`${label}: ${value}${unit}`}
      />
    </div>
  );
}

function StatRow({ label, value, color = 'text-white' }: {
  label: string; value: string; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-sim-border">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}

// ── Chart SVG ─────────────────────────────────────────────────────────────────

function PidChart({ frames, setpoint, behavior }: {
  frames: PidFrame[];
  setpoint: number;
  behavior: string;
}) {
  // Position curve color by behavior
  const curveColor =
    behavior === 'Stable'      ? '#4ade80' :
    behavior === 'Oscillating' ? '#f97316' :
    behavior === 'Diverging'   ? '#f87171' :
    '#38bdf8'; // Underdamped

  // Build position path, clipping at Y_MAX
  const pathD = frames
    .map((f, i) => `${i === 0 ? 'M' : 'L'}${toX(f.t).toFixed(1)},${toY(f.position).toFixed(1)}`)
    .join(' ');

  const spY   = toY(setpoint);
  const tolY1 = toY(setpoint + 5);
  const tolY2 = toY(setpoint - 5);

  // X-axis ticks every 0.5s
  const xTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  // Y-axis ticks every 45°
  const yTicks = [0, 45, 90, 135, 180];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="PID response chart">
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* Plot background */}
      <rect x={PL - 2} y={PT - 4} width={PW + 8} height={PH + 14} fill="#0d1a2e" rx="4" />

      {/* Grid */}
      {xTicks.map((t) => (
        <line key={`x${t}`} x1={toX(t)} y1={PT} x2={toX(t)} y2={PT + PH}
          stroke="#1e293b" strokeWidth="1" />
      ))}
      {yTicks.map((d) => (
        d <= Y_MAX && (
          <line key={`y${d}`} x1={PL} y1={toY(d)} x2={PL + PW} y2={toY(d)}
            stroke="#1e293b" strokeWidth="1" />
        )
      ))}

      {/* Tolerance band (±5°) */}
      {setpoint >= 5 && setpoint <= Y_MAX - 5 && (
        <rect
          x={PL} y={Math.min(tolY1, tolY2)}
          width={PW} height={Math.abs(tolY1 - tolY2)}
          fill="#16a34a" opacity="0.08"
        />
      )}

      {/* Setpoint line */}
      {setpoint <= Y_MAX && (
        <line x1={PL} y1={spY} x2={PL + PW} y2={spY}
          stroke="#4ade80" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" />
      )}

      {/* Position curve */}
      {frames.length > 1 && (
        <path d={pathD} fill="none" stroke={curveColor} strokeWidth="2" />
      )}

      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + PH} stroke="#334155" strokeWidth="1.5" />
      <line x1={PL} y1={PT + PH} x2={PL + PW} y2={PT + PH} stroke="#334155" strokeWidth="1.5" />

      {/* X labels */}
      {xTicks.map((t) => (
        <text key={`xl${t}`} x={toX(t)} y={VH - 6}
          fill="#475569" fontSize="9" textAnchor="middle">{t}s</text>
      ))}

      {/* Y labels */}
      {yTicks.map((d) => (
        d <= Y_MAX && (
          <text key={`yl${d}`} x={PL - 4} y={toY(d) + 3}
            fill="#475569" fontSize="9" textAnchor="end">{d}°</text>
        )
      ))}

      {/* Setpoint label */}
      {setpoint <= Y_MAX && (
        <text x={PL + PW - 2} y={spY - 4} fill="#4ade80" fontSize="8" textAnchor="end">
          SP {setpoint}°
        </text>
      )}

      {/* Behavior label */}
      <text x={PL + 6} y={PT + 12} fill={curveColor} fontSize="9" fontWeight="bold" opacity="0.7">
        {behavior}
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PidTuning() {
  const [kp,       setKp]       = useState(1.0);
  const [ki,       setKi]       = useState(0.0);
  const [kd,       setKd]       = useState(0.0);
  const [setpoint, setSetpoint] = useState(90);
  const [inertia,  setInertia]  = useState(0.5);

  // Derive simulation inline
  const frames = simulatePid({
    kp, ki, kd, setpoint,
    systemInertia: inertia,
    dtS: 0.02,
    simDurationS: SIM_DURATION,
  });

  const TOLERANCE = 5;
  const tSettle  = settlingTime(frames, TOLERANCE);
  const tOs      = overshoot(frames);
  const behavior = detectBehavior(frames, TOLERANCE);

  // Early frame values at ~t=0.1s for showing what each term does
  const earlyFrame: PidFrame = frames[Math.min(5, frames.length - 1)] ?? frames[0];

  const settleColor = tSettle <= 1.0 ? 'text-sim-ok' : tSettle <= 2.0 ? 'text-sim-warn' : 'text-sim-danger';
  const osColor     = tOs < 5 ? 'text-sim-ok' : tOs < 20 ? 'text-sim-warn' : 'text-sim-danger';

  const behaviorColor =
    behavior === 'Stable'      ? 'text-sim-ok' :
    behavior === 'Oscillating' ? 'text-sim-warn' :
    behavior === 'Diverging'   ? 'text-sim-danger' :
    'text-sim-accent';

  return (
    <div className="space-y-5 text-slate-200">
      {/* Chart */}
      <div className="rounded-lg overflow-hidden bg-sim-bg border border-sim-border">
        <PidChart frames={frames} setpoint={setpoint} behavior={behavior} />
      </div>

      {/* Controls + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Gains</div>

          <Slider label="Kp (proportional)" value={kp} min={0} max={5} step={0.01}
            unit="" format={(v) => v.toFixed(2)} onChange={setKp} />
          <Slider label="Ki (integral)" value={ki} min={0} max={2} step={0.005}
            unit="" format={(v) => v.toFixed(3)} onChange={setKi} />
          <Slider label="Kd (derivative)" value={kd} min={0} max={0.5} step={0.001}
            unit="" format={(v) => v.toFixed(3)} onChange={setKd} />

          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 pt-1">System</div>
          <Slider label="Setpoint" value={setpoint} min={0} max={180} step={5}
            unit="°" onChange={setSetpoint} />
          <Slider label="System inertia (lower = faster)" value={inertia} min={0.1} max={2.0} step={0.05}
            unit="" format={(v) => v.toFixed(2)} onChange={setInertia} />

          <button
            onClick={() => { setKp(0); setKi(0); setKd(0); }}
            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
          >
            Zero gains
          </button>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Results</div>

          <StatRow label="Settling time (±5°)"
            value={tSettle === Infinity ? 'Not settled' : `${tSettle.toFixed(2)} s`}
            color={settleColor} />
          <StatRow label="Overshoot"
            value={`${tOs.toFixed(1)}°`}
            color={osColor} />
          <StatRow label="Behavior"
            value={behavior}
            color={behaviorColor} />

          <div className="pt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Terms at t = 0.1 s
          </div>
          <StatRow label="P term" value={earlyFrame.pTerm.toFixed(2)} color="text-sim-accent" />
          <StatRow label="I term" value={earlyFrame.iTerm.toFixed(3)} color="text-slate-300" />
          <StatRow label="D term" value={earlyFrame.dTerm.toFixed(2)} color="text-slate-300" />
          <StatRow label="Output (clamped)" value={earlyFrame.output.toFixed(3)} color="text-white" />

          <div className={`rounded-lg border p-3 text-xs leading-relaxed mt-1 ${
            behavior === 'Stable'
              ? 'bg-green-950 border-green-800 text-green-300'
              : behavior === 'Diverging'
                ? 'bg-red-950 border-red-800 text-red-300'
                : behavior === 'Oscillating'
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-sky-950 border-sky-800 text-sky-300'
          }`}>
            {behavior === 'Stable'
              ? `System settled in ${tSettle.toFixed(2)}s with ${tOs.toFixed(1)}° overshoot. Good tuning.`
              : behavior === 'Diverging'
                ? 'System is diverging — Kp is too high or Kd is negative. Reduce Kp significantly.'
                : behavior === 'Oscillating'
                  ? 'Steady oscillation — reduce Kp or add Kd to damp the response.'
                  : 'Underdamped — system is settling but slowly. Try adding Kd or reducing Kp slightly.'}
          </div>
        </div>
      </div>
    </div>
  );
}
