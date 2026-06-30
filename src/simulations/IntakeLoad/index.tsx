import { useState, useRef, useEffect, useCallback } from 'react';
import katex from 'katex';
import {
  driveForce,
  rollerSurfaceSpeedMs,
  captureForceN,
  inToM,
  round,
} from './physics';

// ── Motor presets ─────────────────────────────────────────────────────────────

const MOTORS = {
  'NEO 550':    { stallTorque: 0.97,  stallCurrent: 100,  freeCurrent: 1.4, freeRPM: 11000 },
  'NEO':        { stallTorque: 3.28,  stallCurrent: 166,  freeCurrent: 1.3, freeRPM: 5676  },
  'Kraken X60': { stallTorque: 9.37,  stallCurrent: 483,  freeCurrent: 2.0, freeRPM: 6000  },
} as const;

type MotorKey = keyof typeof MOTORS;

const ANIM_SPEED = 0.7;   // progress units per second (full travel in ~1.4 s)
const ACCEL_MS2  = 3.0;   // assumed deployment acceleration

// ── SVG layout constants ──────────────────────────────────────────────────────
const VW = 480, VH = 300;

// Rail: fixed tube that the carriage slides along, going over the bumper
const RAIL_START = { x: 108, y: 148 }; // inside robot body (stowed end)
const RAIL_END   = { x: 330, y: 242 }; // on the carpet (deployed end)
const ROLLER_R   = 11;

// Rail geometry (derived once)
const RAIL_DX  = RAIL_END.x - RAIL_START.x;
const RAIL_DY  = RAIL_END.y - RAIL_START.y;
const RAIL_LEN = Math.hypot(RAIL_DX, RAIL_DY);
const RAIL_UX  = RAIL_DX / RAIL_LEN;   // unit vector along rail
const RAIL_UY  = RAIL_DY / RAIL_LEN;
// Perpendicular to rail (pointing "up-left" from rail surface, for normal-force arrows)
const RAIL_NX  = -RAIL_UY;
const RAIL_NY  =  RAIL_UX;
// Rail angle from horizontal (positive = downward slope)
const RAIL_ANGLE_DEG = Math.atan2(RAIL_DY, RAIL_DX) * (180 / Math.PI);
const RAIL_ANGLE_RAD = RAIL_ANGLE_DEG * (Math.PI / 180);

// Carriage position at progress t ∈ [0, 1]
function carriagePos(t: number) {
  return {
    x: RAIL_START.x + RAIL_DX * t,
    y: RAIL_START.y + RAIL_DY * t,
  };
}

// Arrow head polygon points
function arrowHead(x: number, y: number, dx: number, dy: number, size = 7): string {
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return `${x},${y}`;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const bx = x - ux * size, by = y - uy * size;
  return `${x},${y} ${bx + px * size * 0.4},${by + py * size * 0.4} ${bx - px * size * 0.4},${by - py * size * 0.4}`;
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
          {format ? format(value) : value}{unit && ` ${unit}`}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-400 bg-slate-600 cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function StatRow({
  label, value, sub, color = 'text-white',
}: {
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

// ── SVG Visualization ─────────────────────────────────────────────────────────

function IntakeSVG({
  progress, phase, motorTorque, canSupply, carriageMassKg, railAngleDeg,
}: {
  progress: number;
  phase: string;
  motorTorque: number;
  canSupply: boolean;
  carriageMassKg: number;
  railAngleDeg: number;
}) {
  const pos = carriagePos(progress);
  const isMoving   = phase === 'extending' || phase === 'retracting';
  const isDeployed = progress > 0.85;

  // Scale force arrows
  const gravScale  = Math.min(45, Math.max(12, carriageMassKg * 9.81 * 3));
  const motorScale = Math.min(42, Math.max(12, Math.abs(motorTorque) * 22));
  const motorDir   = phase === 'retracting' ? -1 : 1;

  // Gravity arrow: straight down from carriage
  const gravEnd = { x: pos.x, y: pos.y + gravScale };

  // Motor/drive arrow: along the rail direction (extending = forward, retracting = backward)
  const motorEnd = {
    x: pos.x + RAIL_UX * motorScale * motorDir,
    y: pos.y + RAIL_UY * motorScale * motorDir,
  };

  // Rail tube visual — two parallel lines offset ±4 perpendicular to rail
  const railOff = 4;
  function railLine(side: 1 | -1) {
    return {
      x1: RAIL_START.x + RAIL_NX * railOff * side,
      y1: RAIL_START.y + RAIL_NY * railOff * side,
      x2: RAIL_END.x   + RAIL_NX * railOff * side,
      y2: RAIL_END.y   + RAIL_NY * railOff * side,
    };
  }
  const rl1 = railLine(1), rl2 = railLine(-1);

  // Rack teeth (small perpendicular ticks along rail)
  const toothCount = 14;
  const teeth = Array.from({ length: toothCount }, (_, i) => {
    const t = (i + 0.5) / toothCount;
    const cx = RAIL_START.x + RAIL_DX * t;
    const cy = RAIL_START.y + RAIL_DY * t;
    return {
      x1: cx + RAIL_NX * railOff,   y1: cy + RAIL_NY * railOff,
      x2: cx + RAIL_NX * railOff * 3, y2: cy + RAIL_NY * railOff * 3,
    };
  });

  // Carriage body: rect centered on pos, aligned to rail
  const cw = 22, ch = 14;
  const carXform = `translate(${pos.x}, ${pos.y}) rotate(${railAngleDeg})`;

  // Status color
  const statusColor = canSupply ? '#4ade80' : '#f87171';

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="Linear intake simulation" className="block">
      {/* Background */}
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* Carpet */}
      <rect x={0} y={248} width={VW} height={52} fill="#14291a" />
      {[40, 120, 200, 280, 360, 440].map((x) => (
        <line key={x} x1={x} y1={248} x2={x} y2={VH} stroke="#1e4020" strokeWidth="1" />
      ))}
      <line x1={0} y1={248} x2={VW} y2={248} stroke="#334155" strokeWidth="2" />

      {/* Robot chassis */}
      <rect x={18} y={88} width={150} height={124} fill="#1e293b" rx="3" />
      <rect x={18} y={88} width={150} height={5}   fill="#334155" rx="2" />
      <line x1={18} y1={145} x2={168} y2={145} stroke="#334155" strokeWidth="1" />
      {/* RIO box */}
      <rect x={45} y={106} width={50} height={30} fill="#0f172a" rx="2" opacity="0.6" />
      <text x={70} y={126} fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">RIO</text>

      {/* Bumper */}
      <rect x={14} y={210} width={158} height={22} fill="#7f1d1d" rx="3" />
      <rect x={14} y={210} width={158} height={5}  fill="#991b1b" rx="2" />

      {/* Wheels */}
      {[58, 148].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={246} r={13} fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <circle cx={cx} cy={246} r={5}  fill="#334155" />
        </g>
      ))}

      {/* ── Rail (tube with rack teeth) ── */}
      {/* Rail tube fill */}
      <line x1={rl1.x1} y1={rl1.y1} x2={rl1.x2} y2={rl1.y2} stroke="#475569" strokeWidth="2" />
      <line x1={rl2.x1} y1={rl2.y1} x2={rl2.x2} y2={rl2.y2} stroke="#475569" strokeWidth="2" />
      {/* Rail fill */}
      <line
        x1={RAIL_START.x} y1={RAIL_START.y}
        x2={RAIL_END.x}   y2={RAIL_END.y}
        stroke="#334155" strokeWidth="8" strokeLinecap="butt"
      />
      {/* Rack teeth */}
      {teeth.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#64748b" strokeWidth="1.5" />
      ))}
      {/* Rail centerline */}
      <line
        x1={RAIL_START.x} y1={RAIL_START.y}
        x2={RAIL_END.x}   y2={RAIL_END.y}
        stroke="#1e293b" strokeWidth="2" strokeDasharray="5,3"
      />
      {/* Rail end caps */}
      <circle cx={RAIL_START.x} cy={RAIL_START.y} r={5} fill="#334155" stroke="#475569" strokeWidth="1.5" />
      <circle cx={RAIL_END.x}   cy={RAIL_END.y}   r={4} fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* ── Carriage ── */}
      {/* Carriage body (rect aligned to rail angle) */}
      <g transform={carXform}>
        <rect
          x={-cw / 2} y={-ch / 2} width={cw} height={ch}
          fill="#1e3a5f" stroke={canSupply ? '#38bdf8' : '#f87171'} strokeWidth="2" rx="3"
        />
        {/* Pinion gear circle (small, inside carriage) */}
        <circle cx={0} cy={0} r={4} fill="#334155" stroke="#64748b" strokeWidth="1" />
        <line x1={0} y1={-4} x2={0} y2={4} stroke="#64748b" strokeWidth="1" />
      </g>

      {/* Roller at carriage position */}
      <circle
        cx={pos.x} cy={pos.y} r={ROLLER_R}
        fill="#1e293b" stroke={isMoving ? '#f59e0b' : '#38bdf8'} strokeWidth="2.5"
      />
      {/* Roller spin lines */}
      {[0, 60, 120].map((a) => {
        const ar = (a + progress * 720) * (Math.PI / 180);
        return (
          <line key={a}
            x1={pos.x + ROLLER_R * 0.3 * Math.cos(ar)}
            y1={pos.y + ROLLER_R * 0.3 * Math.sin(ar)}
            x2={pos.x + ROLLER_R * 0.85 * Math.cos(ar)}
            y2={pos.y + ROLLER_R * 0.85 * Math.sin(ar)}
            stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6"
          />
        );
      })}

      {/* Game piece when deployed */}
      {isDeployed && (
        <circle
          cx={pos.x + ROLLER_R * 1.6}
          cy={pos.y - ROLLER_R * 0.6}
          r={12} fill="#f59e0b" fillOpacity="0.9" stroke="#d97706" strokeWidth="1.5"
        />
      )}

      {/* ── Force arrows ── */}
      {/* Gravity: straight down */}
      <line
        x1={pos.x} y1={pos.y}
        x2={gravEnd.x} y2={gravEnd.y}
        stroke="#f87171" strokeWidth="2"
      />
      <polygon points={arrowHead(gravEnd.x, gravEnd.y, 0, gravScale)} fill="#f87171" />
      <text x={gravEnd.x + 5} y={gravEnd.y} fill="#f87171" fontSize="9">mg</text>

      {/* Motor/drive arrow: along rail when moving */}
      {isMoving && (
        <>
          <line
            x1={pos.x} y1={pos.y}
            x2={motorEnd.x} y2={motorEnd.y}
            stroke="#38bdf8" strokeWidth="2"
          />
          <polygon
            points={arrowHead(
              motorEnd.x, motorEnd.y,
              RAIL_UX * motorScale * motorDir,
              RAIL_UY * motorScale * motorDir,
            )}
            fill="#38bdf8"
          />
        </>
      )}

      {/* ── Labels ── */}
      {/* Rail angle callout */}
      <path
        d={`M ${RAIL_START.x + 30} ${RAIL_START.y} A 30 30 0 0 1 ${
          RAIL_START.x + 30 * Math.cos(RAIL_ANGLE_RAD)
        } ${RAIL_START.y + 30 * Math.sin(RAIL_ANGLE_RAD)}`}
        fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2,2"
      />
      <text
        x={RAIL_START.x + 34} y={RAIL_START.y + 16}
        fill="#64748b" fontSize="9" fontFamily="monospace"
      >
        {round(RAIL_ANGLE_DEG, 0)}°
      </text>

      {/* Progress bar along rail */}
      <line
        x1={RAIL_START.x} y1={RAIL_START.y}
        x2={RAIL_START.x + RAIL_DX * progress}
        y2={RAIL_START.y + RAIL_DY * progress}
        stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.35"
      />

      {/* Status badge */}
      <rect x={322} y={12} width={148} height={22} rx="4"
        fill={canSupply ? '#14532d' : '#450a0a'} />
      <text x={396} y={27} fill={statusColor}
        fontSize="11" fontWeight="bold" textAnchor="middle">
        Motor {canSupply ? '✓ can extend' : '✗ force exceeded'}
      </text>

      {/* Phase label */}
      <text x={VW / 2} y={VH - 8} fill="#475569" fontSize="10" textAnchor="middle">
        {phase === 'retracted'  ? 'Carriage stowed inside robot' :
         phase === 'extending'  ? '▶ Extending over bumper…' :
         phase === 'deployed'   ? 'Deployed — intaking at carpet level' :
                                  '◀ Retracting inside robot…'}
      </text>

      {/* Extension % */}
      <text
        x={pos.x + 2} y={pos.y - ROLLER_R - 5}
        fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle"
      >
        {round(progress * 100, 0)}%
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function IntakeLoad() {
  const [progress, setProgress]  = useState(0);   // 0 = stowed, 1 = deployed
  const [phase, setPhase]        = useState<'retracted' | 'extending' | 'deployed' | 'retracting'>('retracted');

  // Motor / deploy motor controls
  const [motorKey, setMotorKey]       = useState<MotorKey>('NEO 550');
  const [deployGR, setDeployGR]       = useState(16);
  const [pinionRadM, setPinionRadM]   = useState(0.012); // effective drive radius (pinion/spool)
  const [carriageMassKg, setCarriageMassKg] = useState(0.8);

  // Roller controls
  const [rollerDiamIn, setRollerDiamIn]   = useState(2.0);
  const [rollerGR, setRollerGR]           = useState(3);
  const [compressionN, setCompressionN]   = useState(20);
  const [muS, setMuS]                     = useState(0.8);

  const phaseRef    = useRef(phase);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef      = useRef<number | null>(null);

  const motor = MOTORS[motorKey];

  // ── Physics ────────────────────────────────────────────────────────────────
  const isExtending = phase === 'extending' || phase === 'deployed';
  const driveF = driveForce(carriageMassKg, RAIL_ANGLE_RAD, muS, ACCEL_MS2, isExtending);

  // Motor torque at output shaft, then reflected to motor
  const outputTorque = driveF * pinionRadM;
  const motorNeed    = outputTorque / (deployGR * 0.85);
  const canSupply    = motor.stallTorque >= motorNeed;

  // Motor current (linear interpolation from free to stall)
  const torqueRatio  = Math.min(Math.max(Math.abs(motorNeed) / motor.stallTorque, 0), 1);
  const current      = motor.freeCurrent + torqueRatio * (motor.stallCurrent - motor.freeCurrent);

  // Roller
  const rollerSpeed  = rollerSurfaceSpeedMs(motor.freeRPM, rollerGR, inToM(rollerDiamIn));
  const capture      = captureForceN(compressionN, muS);

  // ── Animation ─────────────────────────────────────────────────────────────
  const animate = useCallback((ts: number) => {
    if (lastTimeRef.current === null) lastTimeRef.current = ts;
    const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = ts;

    const p = phaseRef.current;
    setProgress((prev) => {
      if (p === 'extending') {
        const next = prev + ANIM_SPEED * dt;
        if (next >= 1) {
          phaseRef.current = 'deployed';
          setPhase('deployed');
          return 1;
        }
        return next;
      }
      if (p === 'retracting') {
        const next = prev - ANIM_SPEED * dt;
        if (next <= 0) {
          phaseRef.current = 'retracted';
          setPhase('retracted');
          return 0;
        }
        return next;
      }
      return prev;
    });

    if (phaseRef.current === 'extending' || phaseRef.current === 'retracting') {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  function startExtend() {
    if (phase === 'deployed' || phase === 'extending') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    phaseRef.current = 'extending';
    setPhase('extending');
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
  }

  function startRetract() {
    if (phase === 'retracted' || phase === 'retracting') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    phaseRef.current = 'retracting';
    setPhase('retracting');
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
  }

  // ── Live equations ─────────────────────────────────────────────────────────
  const sinTheta  = round(Math.sin(RAIL_ANGLE_RAD), 3);
  const cosTheta  = round(Math.cos(RAIL_ANGLE_RAD), 3);
  const mg        = round(carriageMassKg * 9.81, 2);

  const latexForce = String.raw`F_{drive} = mg\sin\theta + \mu_s mg\cos\theta + ma`
    + String.raw` = ${mg}{\times}${sinTheta} + ${muS}{\times}${mg}{\times}${cosTheta} + ${carriageMassKg}{\times}${ACCEL_MS2}`
    + String.raw` = ${round(driveF, 1)}\text{ N}`;

  const latexTorque = String.raw`\tau_{motor} = \frac{F_{drive} \times r_{eff}}{GR \times \eta}`
    + String.raw` = \frac{${round(driveF, 1)} \times ${pinionRadM}}{${deployGR} \times 0.85}`
    + String.raw` = ${round(motorNeed, 3)}\text{ N·m}`;

  // ── Current color ──────────────────────────────────────────────────────────
  const currentColor = current < 40 ? 'text-sim-ok' : current < 100 ? 'text-sim-warn' : 'text-sim-danger';

  return (
    <div className="space-y-5 text-slate-200">
      {/* SVG + buttons */}
      <div className="rounded-lg overflow-hidden bg-sim-bg border border-sim-border">
        <IntakeSVG
          progress={progress}
          phase={phase}
          motorTorque={motorNeed}
          canSupply={canSupply}
          carriageMassKg={carriageMassKg}
          railAngleDeg={RAIL_ANGLE_DEG}
        />
        <div className="flex gap-3 px-4 pb-4 pt-1">
          <button
            onClick={startExtend}
            disabled={phase === 'deployed' || phase === 'extending'}
            className="flex-1 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
          >
            ▶ Extend
          </button>
          <button
            onClick={startRetract}
            disabled={phase === 'retracted' || phase === 'retracting'}
            className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
          >
            ◀ Retract
          </button>
        </div>
      </div>

      {/* Controls + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Deploy Motor</p>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Motor</label>
            <select
              value={motorKey}
              onChange={(e) => setMotorKey(e.target.value as MotorKey)}
              className="w-full bg-sim-panel border border-sim-border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
            >
              {(Object.keys(MOTORS) as MotorKey[]).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <Slider label="Gear ratio (deploy)" value={deployGR} min={4} max={40} step={1}
            unit=":1" onChange={setDeployGR} />
          <Slider label="Pinion / spool radius" value={pinionRadM} min={0.006} max={0.025} step={0.001}
            unit="m" format={(v) => v.toFixed(3)} onChange={setPinionRadM} />
          <Slider label="Carriage mass" value={carriageMassKg} min={0.2} max={2.5} step={0.1}
            unit="kg" format={(v) => v.toFixed(1)} onChange={setCarriageMassKg} />

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 pt-2">Roller</p>
          <Slider label="Roller diameter" value={rollerDiamIn} min={1} max={3} step={0.25}
            unit="in" format={(v) => v.toFixed(2)} onChange={setRollerDiamIn} />
          <Slider label="Roller gear ratio" value={rollerGR} min={1} max={10} step={0.5}
            unit=":1" format={(v) => v.toFixed(1)} onChange={setRollerGR} />
          <Slider label="Compression force" value={compressionN} min={5} max={60} step={1}
            unit="N" onChange={setCompressionN} />
          <Slider label="Friction coefficient (μ)" value={muS} min={0.3} max={1.3} step={0.05}
            unit="" format={(v) => v.toFixed(2)} onChange={setMuS} />
        </div>

        {/* Stats */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Live Results</p>

          <StatRow
            label={`Rail angle (fixed, ${round(RAIL_ANGLE_DEG, 0)}°)`}
            value={`sinθ = ${sinTheta}`}
            sub={`cosθ = ${cosTheta}`}
            color="text-slate-300"
          />
          <StatRow
            label="Drive force (extending)"
            value={`${round(driveF, 1)} N`}
            sub={`${round(carriageMassKg * 9.81 * sinTheta, 1)} grav + ${round(muS * carriageMassKg * 9.81 * cosTheta, 1)} fric + ${round(carriageMassKg * ACCEL_MS2, 1)} inert`}
            color={canSupply ? 'text-sim-ok' : 'text-sim-danger'}
          />
          <StatRow
            label={`Output torque (r=${pinionRadM} m)`}
            value={`${round(outputTorque, 3)} N·m`}
            sub="F_drive × r_eff"
            color="text-slate-300"
          />
          <StatRow
            label={`Motor torque needed (${deployGR}:1)`}
            value={`${round(motorNeed, 3)} N·m`}
            sub={`stall: ${motor.stallTorque} N·m`}
            color={canSupply ? 'text-sim-ok' : 'text-sim-danger'}
          />
          <StatRow
            label="Motor current draw"
            value={`${round(current, 1)} A`}
            sub={`stall: ${motor.stallCurrent} A`}
            color={currentColor}
          />

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 pt-3 pb-1">Roller</p>
          <StatRow
            label="Roller surface speed"
            value={`${round(rollerSpeed, 2)} m/s`}
            sub={`${round(rollerSpeed / 0.3048, 1)} ft/s`}
            color="text-sim-accent"
          />
          <StatRow
            label="Capture force"
            value={`${round(capture, 1)} N`}
            sub={`${compressionN} N × μ${muS.toFixed(2)}`}
            color={capture >= 15 ? 'text-sim-ok' : 'text-sim-warn'}
          />

          {/* Insight card */}
          {!canSupply ? (
            <div className="mt-3 rounded-lg bg-red-950 border border-red-800 p-3 text-xs text-red-300 leading-relaxed">
              <span className="font-semibold">⚠ Motor cannot extend.</span> Required motor torque (
              {round(motorNeed, 3)} N·m) exceeds stall torque ({motor.stallTorque} N·m). Increase gear
              ratio, use a larger pinion, or reduce carriage mass.
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-green-950 border border-green-800 p-3 text-xs text-green-300 leading-relaxed">
              <span className="font-semibold">✓ Motor can extend.</span> Safety margin:{' '}
              {round(motor.stallTorque / motorNeed, 1)}×. Current at deployment: {round(current, 1)} A
              — {current < 40 ? 'well within PDP limits.' : current < 80 ? 'moderate draw, watch during defense.' : 'high draw — check breaker sizing.'}
            </div>
          )}
        </div>
      </div>

      {/* Live equations */}
      <div className="rounded-lg bg-sim-panel border border-sim-border p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Live equations</p>
        <div
          className="overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(latexForce, { throwOnError: false, displayMode: true }),
          }}
        />
        <div
          className="overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(latexTorque, { throwOnError: false, displayMode: true }),
          }}
        />
        <p className="text-xs text-slate-500 leading-relaxed">
          The rail is fixed at {round(RAIL_ANGLE_DEG, 0)}° below horizontal — gravity adds{' '}
          {round(carriageMassKg * 9.81 * sinTheta, 1)} N along the rail and{' '}
          {round(carriageMassKg * 9.81 * cosTheta, 1)} N into the rail surface (creating friction).
          Retraction against gravity is the worst case; the motor always sizes for that direction.
        </p>
      </div>
    </div>
  );
}
