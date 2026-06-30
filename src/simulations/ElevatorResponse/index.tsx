import { useState, useEffect, useRef, useCallback } from 'react';
import {
  simulateElevator,
  travelTime,
  maxVelocity,
  peakCurrent,
  peakAcceleration,
  maxOutputForceN,
  freeSpeedLinearMps,
  type ElevatorConfig,
  type ElevatorFrame,
} from './physics';

// ── Motor presets ─────────────────────────────────────────────────────────────

const MOTORS = {
  neo: { label: 'NEO', stallTorqueNm: 3.28, freeSpeedRPM: 5676, stallCurrentA: 166 },
  kraken: { label: 'Kraken X60', stallTorqueNm: 9.37, freeSpeedRPM: 6000, stallCurrentA: 483 },
} as const;
type MotorId = keyof typeof MOTORS;

// ── Constants ─────────────────────────────────────────────────────────────────

const SPROCKET_RADIUS = 0.022; // m (~1.75-inch pitch diameter, common in FRC)
const DT_MS = 16; // animation tick ~60fps

// ── SVG layout ────────────────────────────────────────────────────────────────

const VW = 500;
const VH = 250;

// Elevator shaft (left panel)
const SHAFT_X = 75;
const SHAFT_TOP = 20;
const SHAFT_BOT = 230;
const SHAFT_H = SHAFT_BOT - SHAFT_TOP;
const CAR_W = 34;
const CAR_H = 20;

// Velocity plot (right panel)
const PLT_L = 160;
const PLT_R = VW - 20;
const PLT_T = 20;
const PLT_B = 230;
const PLT_W = PLT_R - PLT_L;
const PLT_H = PLT_B - PLT_T;

function toPlotX(t: number, maxT: number): number {
  return PLT_L + (t / Math.max(maxT, 0.01)) * PLT_W;
}
function toPlotY(v: number, maxV: number): number {
  return PLT_B - (v / Math.max(maxV, 0.01)) * PLT_H;
}
function toCarriageY(posM: number, targetM: number): number {
  const frac = Math.min(posM / Math.max(targetM, 0.01), 1);
  return SHAFT_BOT - CAR_H / 2 - frac * SHAFT_H;
}

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
          {format ? format(value) : value} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-400 bg-slate-600 cursor-pointer"
        aria-label={`${label}: ${value} ${unit}`}
      />
    </div>
  );
}

function StatRow({ label, value, sub, color = 'text-white' }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-sim-border">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
        {sub && <div className="text-xs text-slate-500 font-mono">{sub}</div>}
      </div>
    </div>
  );
}

// ── Elevator SVG ──────────────────────────────────────────────────────────────

function ElevatorSVG({ frames, frameIdx, config }: {
  frames: ElevatorFrame[];
  frameIdx: number;
  config: ElevatorConfig;
}) {
  const cur = frames[Math.min(frameIdx, frames.length - 1)];
  const maxT = frames[frames.length - 1]?.t ?? 1;
  const maxV = maxVelocity(frames) * 1.15 || 1;

  const carriageY = toCarriageY(cur?.posM ?? 0, config.targetHeightM);
  const targetY = SHAFT_TOP;

  // Velocity curve path
  const velPath = frames
    .map((f, i) => `${i === 0 ? 'M' : 'L'}${toPlotX(f.t, maxT).toFixed(1)},${toPlotY(f.velMs, maxV).toFixed(1)}`)
    .join(' ');

  // Current time marker
  const markerX = toPlotX(cur?.t ?? 0, maxT);

  // Axis tick marks
  const ticks = [0.25, 0.5, 0.75, 1.0].map((f) => ({
    x: toPlotX(maxT * f, maxT),
    t: (maxT * f).toFixed(1),
  }));
  const vTicks = [0.25, 0.5, 0.75, 1.0].map((f) => ({
    y: toPlotY(maxV * f, maxV),
    v: (maxV * f).toFixed(1),
  }));

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="Elevator response visualization">
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* ── Shaft ─────────────────────────────────── */}
      {/* Rail left */}
      <line x1={SHAFT_X - 5} y1={SHAFT_TOP} x2={SHAFT_X - 5} y2={SHAFT_BOT} stroke="#334155" strokeWidth="4" />
      {/* Rail right */}
      <line x1={SHAFT_X + 5} y1={SHAFT_TOP} x2={SHAFT_X + 5} y2={SHAFT_BOT} stroke="#334155" strokeWidth="4" />

      {/* Ground */}
      <rect x={SHAFT_X - 25} y={SHAFT_BOT} width={50} height={6} fill="#334155" rx="2" />

      {/* Target line */}
      <line x1={SHAFT_X - 22} y1={targetY + CAR_H / 2} x2={SHAFT_X + 22} y2={targetY + CAR_H / 2}
        stroke="#4ade80" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={SHAFT_X + 26} y={targetY + CAR_H / 2 + 4} fill="#4ade80" fontSize="8" textAnchor="start">
        {config.targetHeightM.toFixed(1)}m
      </text>

      {/* Height markers */}
      {[0.25, 0.5, 0.75].map((f) => {
        const y = SHAFT_BOT - f * SHAFT_H;
        return (
          <g key={f}>
            <line x1={SHAFT_X - 18} y1={y} x2={SHAFT_X - 6} y2={y} stroke="#1e293b" strokeWidth="1" />
            <text x={SHAFT_X - 20} y={y + 4} fill="#475569" fontSize="8" textAnchor="end">
              {(f * config.targetHeightM).toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Carriage */}
      <rect
        x={SHAFT_X - CAR_W / 2} y={carriageY - CAR_H / 2}
        width={CAR_W} height={CAR_H}
        fill="#2563eb" rx="3"
      />
      {/* Carriage detail lines */}
      <line x1={SHAFT_X - CAR_W / 2 + 4} y1={carriageY - 3} x2={SHAFT_X + CAR_W / 2 - 4} y2={carriageY - 3}
        stroke="#60a5fa" strokeWidth="1.5" />
      <line x1={SHAFT_X - CAR_W / 2 + 4} y1={carriageY + 3} x2={SHAFT_X + CAR_W / 2 - 4} y2={carriageY + 3}
        stroke="#60a5fa" strokeWidth="1.5" />

      {/* Height label below carriage */}
      <text x={SHAFT_X} y={SHAFT_BOT + 16} fill="#64748b" fontSize="9" textAnchor="middle">
        {(cur?.posM ?? 0).toFixed(2)} m
      </text>

      {/* Shaft label */}
      <text x={SHAFT_X} y={VH - 4} fill="#475569" fontSize="8" textAnchor="middle">Carriage</text>

      {/* ── Velocity plot ─────────────────────────── */}
      {/* Plot background */}
      <rect x={PLT_L - 2} y={PLT_T - 4} width={PLT_W + 12} height={PLT_H + 14} fill="#0d1a2e" rx="4" />

      {/* Grid lines */}
      {vTicks.map(({ y, v }) => (
        <g key={v}>
          <line x1={PLT_L} y1={y} x2={PLT_R} y2={y} stroke="#1e293b" strokeWidth="1" />
          <text x={PLT_L - 4} y={y + 3} fill="#475569" fontSize="8" textAnchor="end">{v}</text>
        </g>
      ))}
      {ticks.map(({ x, t }) => (
        <g key={t}>
          <line x1={x} y1={PLT_T} x2={x} y2={PLT_B} stroke="#1e293b" strokeWidth="1" />
          <text x={x} y={PLT_B + 12} fill="#475569" fontSize="8" textAnchor="middle">{t}s</text>
        </g>
      ))}

      {/* Axes */}
      <line x1={PLT_L} y1={PLT_T} x2={PLT_L} y2={PLT_B} stroke="#334155" strokeWidth="1.5" />
      <line x1={PLT_L} y1={PLT_B} x2={PLT_R} y2={PLT_B} stroke="#334155" strokeWidth="1.5" />

      {/* Axis labels */}
      <text x={PLT_L + PLT_W / 2} y={VH - 2} fill="#64748b" fontSize="8" textAnchor="middle">Time (s)</text>
      <text
        x={PLT_L - 28} y={PLT_T + PLT_H / 2}
        fill="#64748b" fontSize="8" textAnchor="middle"
        transform={`rotate(-90, ${PLT_L - 28}, ${PLT_T + PLT_H / 2})`}
      >
        Vel (m/s)
      </text>

      {/* Velocity curve */}
      {frames.length > 1 && (
        <path d={velPath} fill="none" stroke="#38bdf8" strokeWidth="2" />
      )}

      {/* Current time marker */}
      {frames.length > 1 && (
        <line x1={markerX} y1={PLT_T} x2={markerX} y2={PLT_B}
          stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />
      )}

      {/* "Velocity vs Time" label */}
      <text x={PLT_L + PLT_W / 2} y={PLT_T + 12} fill="#1e3a8a" fontSize="9" textAnchor="middle" opacity="0.4">
        Velocity vs Time
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ElevatorResponse() {
  const [motorId,    setMotorId]    = useState<MotorId>('neo');
  const [massKg,     setMassKg]     = useState(4);
  const [gearRatio,  setGearRatio]  = useState(15);
  const [targetM,    setTargetM]    = useState(1.2);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [frameIdx,   setFrameIdx]   = useState(0);

  const animRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIdxRef = useRef(0);

  const motor = MOTORS[motorId];

  const config: ElevatorConfig = {
    massKg,
    gearRatio,
    sprocketRadiusM: SPROCKET_RADIUS,
    motorStallTorqueNm: motor.stallTorqueNm,
    motorFreeSpeedRPM: motor.freeSpeedRPM,
    motorStallCurrentA: motor.stallCurrentA,
    targetHeightM: targetM,
  };

  // Derive simulation inline
  const frames = simulateElevator(config);
  const tTotal  = travelTime(frames);
  const vMax    = maxVelocity(frames);
  const iMax    = peakCurrent(frames);
  const aMax    = peakAcceleration(frames);
  const canLift = maxOutputForceN(config) > massKg * 9.81;
  const vFree   = freeSpeedLinearMps(config);

  // Reset frame when params change
  const resetAnim = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = null;
    frameIdxRef.current = 0;
    setFrameIdx(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => { resetAnim(); }, [massKg, gearRatio, targetM, motorId, resetAnim]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
      return;
    }

    animRef.current = setInterval(() => {
      frameIdxRef.current += 1;
      if (frameIdxRef.current >= frames.length - 1) {
        frameIdxRef.current = frames.length - 1;
        setFrameIdx(frames.length - 1);
        setIsPlaying(false);
        if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
        return;
      }
      setFrameIdx(frameIdxRef.current);
    }, DT_MS);

    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isPlaying, frames.length]);

  const currentColor = iMax < 80 ? 'text-sim-ok' : iMax < 150 ? 'text-sim-warn' : 'text-sim-danger';

  return (
    <div className="space-y-5 text-slate-200">
      {/* SVG visualization */}
      <div className="rounded-lg overflow-hidden bg-sim-bg border border-sim-border">
        <ElevatorSVG frames={frames} frameIdx={frameIdx} config={config} />
      </div>

      {/* Play / Reset */}
      <div className="flex gap-3">
        <button
          onClick={() => { resetAnim(); setTimeout(() => setIsPlaying(true), 50); }}
          disabled={!canLift}
          className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          ▶ Play
        </button>
        <button
          onClick={resetAnim}
          className="px-4 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
        >
          ↺ Reset
        </button>
        {!canLift && (
          <span className="text-xs text-sim-danger self-center">
            Motor cannot lift this mass — reduce gear ratio or increase motor torque.
          </span>
        )}
      </div>

      {/* Controls + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Parameters</div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Motor</label>
            <select
              value={motorId}
              onChange={(e) => setMotorId(e.target.value as MotorId)}
              className="w-full bg-sim-panel border border-sim-border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
            >
              {(Object.keys(MOTORS) as MotorId[]).map((id) => (
                <option key={id} value={id}>{MOTORS[id].label}</option>
              ))}
            </select>
          </div>

          <Slider label="Carriage mass" value={massKg} min={1} max={10} step={0.5} unit="kg"
            format={(v) => v.toFixed(1)} onChange={setMassKg} />

          <Slider label="Gear ratio" value={gearRatio} min={5} max={30} step={1} unit=":1"
            onChange={setGearRatio} />

          <Slider label="Target height" value={targetM} min={0.3} max={1.8} step={0.1} unit="m"
            format={(v) => v.toFixed(1)} onChange={setTargetM} />
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">Results</div>
          <StatRow label="Travel time"
            value={canLift ? (tTotal >= 0 ? `${tTotal.toFixed(2)} s` : '>6 s') : 'N/A'}
            color="text-sim-accent" />
          <StatRow label="Peak velocity"
            value={canLift ? `${vMax.toFixed(2)} m/s` : 'N/A'}
            sub={`Free speed: ${vFree.toFixed(2)} m/s`}
            color="text-white" />
          <StatRow label="Peak current"
            value={canLift ? `${iMax.toFixed(0)} A` : 'N/A'}
            color={currentColor} />
          <StatRow label="Peak acceleration"
            value={canLift ? `${aMax.toFixed(2)} m/s²` : 'N/A'}
            sub={canLift ? `${(aMax / 9.81).toFixed(2)}g` : undefined}
            color="text-sim-ok" />

          <div className={`rounded-lg border p-3 text-xs leading-relaxed mt-2 ${
            !canLift
              ? 'bg-red-950 border-red-700 text-red-300'
              : tTotal < 1.0
                ? 'bg-green-950 border-green-800 text-green-300'
                : tTotal < 2.0
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            {!canLift
              ? 'Motor output force is less than gravity. The elevator will not move. Reduce mass, increase gear ratio, or use a stronger motor.'
              : tTotal < 1.0
                ? `Fast elevator — ${tTotal.toFixed(2)}s travel. Good for cycle time.`
                : tTotal < 2.0
                  ? `Moderate travel time. Consider higher gear ratio or more motor power for faster cycles.`
                  : `Slow elevator (${tTotal.toFixed(2)}s). Consider a lower gear ratio, more motors, or a faster-spinning motor.`}
          </div>
        </div>
      </div>
    </div>
  );
}
