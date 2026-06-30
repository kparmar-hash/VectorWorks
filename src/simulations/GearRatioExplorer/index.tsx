import { useState, useEffect, useRef, useCallback } from 'react';
import katex from 'katex';
import { MOTORS, MOTOR_LIST } from '../../data/motors';
import {
  topSpeedMps,
  maxAccelMps2,
  isTractionLimited,
  maxMotorForceN,
  maxTractionForceN,
  traversalTimeS,
  positionAtTimeM,
  torqueSpeedCurve,
  torqueAtSpeedNm,
  mpsToFps,
  inToM,
  lbsToKg,
  round,
  FIELD_DISTANCE_M,
  FIELD_DISTANCE_FT,
  type DrivetrainParams,
} from './physics';

// ── Canvas drawing helpers ────────────────────────────────────────────────────

const CANVAS_W = 600;
const CANVAS_H = 160;
const FIELD_Y  = 65;
const FIELD_H  = 50;
const ROBOT_W  = 38;
const ROBOT_H  = 32;
const PAD_L    = 30;
const PAD_R    = 30;
const TRACK_W  = CANVAS_W - PAD_L - PAD_R;

function drawField(ctx: CanvasRenderingContext2D, robotX: number, label: string) {
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(dpr, dpr);

  // Clear
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Carpet
  ctx.fillStyle = '#1a3a1a';
  ctx.fillRect(PAD_L, FIELD_Y, TRACK_W, FIELD_H);

  // Carpet lines
  ctx.strokeStyle = '#2d6a2d';
  ctx.lineWidth = 1;
  for (let x = PAD_L; x < PAD_L + TRACK_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, FIELD_Y);
    ctx.lineTo(x, FIELD_Y + FIELD_H);
    ctx.stroke();
  }

  // Alliance wall (left)
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(PAD_L - 6, FIELD_Y - 4, 6, FIELD_H + 8);

  // Center line
  ctx.strokeStyle = '#ffffff44';
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD_L + TRACK_W / 2, FIELD_Y);
  ctx.lineTo(PAD_L + TRACK_W / 2, FIELD_Y + FIELD_H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Target wall (right)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(PAD_L + TRACK_W, FIELD_Y - 4, 6, FIELD_H + 8);

  // Labels
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Alliance', PAD_L, FIELD_Y - 8);
  ctx.fillText(`${FIELD_DISTANCE_FT} ft`, PAD_L + TRACK_W / 2, FIELD_Y - 8);
  ctx.fillText('Opp.', PAD_L + TRACK_W, FIELD_Y - 8);

  // Robot
  const rx = PAD_L + robotX * TRACK_W - ROBOT_W / 2;
  const ry = FIELD_Y + (FIELD_H - ROBOT_H) / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(rx + 3, ry + 3, ROBOT_W, ROBOT_H);

  // Body
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(rx, ry, ROBOT_W, ROBOT_H);

  // Bumper stripes
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(rx, ry, ROBOT_W, 5);
  ctx.fillRect(rx, ry + ROBOT_H - 5, ROBOT_W, 5);

  // Number "2"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('■', rx + ROBOT_W / 2, ry + ROBOT_H / 2 + 5);

  // Speed label
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, CANVAS_W / 2, CANVAS_H - 8);

  ctx.restore();
}

// ── Motor curve SVG ───────────────────────────────────────────────────────────

function MotorCurve({ params, motorRPM }: { params: DrivetrainParams; motorRPM: number }) {
  const curve = torqueSpeedCurve(params.motor, 60);
  const maxT  = params.motor.stallTorqueNm;
  const maxR  = params.motor.freeSpeedRPM;

  const W = 240, H = 120, PL = 40, PB = 24, PT = 12, PR = 12;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const toX = (rpm: number) => PL + (rpm / maxR) * iw;
  const toY = (t: number)   => PT + ih - (t / maxT) * ih;

  const pathD = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.rpm).toFixed(1)},${toY(p.torqueNm).toFixed(1)}`)
    .join(' ');

  const opRPM  = Math.min(motorRPM, maxR);
  const opT    = torqueAtSpeedNm(params.motor, opRPM);
  const opX    = toX(opRPM);
  const opY    = toY(opT);

  const fmt = (n: number, d = 1) => round(n, d).toFixed(d);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[240px]" aria-label="Motor torque-speed curve">
      {/* Background */}
      <rect width={W} height={H} fill="#1e293b" rx="6" />

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f}
          x1={PL} y1={toY(maxT * f)} x2={PL + iw} y2={toY(maxT * f)}
          stroke="#334155" strokeWidth="1"
        />
      ))}

      {/* Curve */}
      <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" />

      {/* Operating point */}
      <line x1={opX} y1={PT} x2={opX} y2={PT + ih} stroke="#f59e0b44" strokeWidth="1" strokeDasharray="3,2" />
      <circle cx={opX} cy={opY} r="5" fill="#f59e0b" />

      {/* Axis labels */}
      <text x={PL} y={H - 6} fill="#64748b" fontSize="9" textAnchor="start">0</text>
      <text x={PL + iw} y={H - 6} fill="#64748b" fontSize="9" textAnchor="end">{fmt(maxR / 1000, 1)}k RPM</text>
      <text x={PL - 4} y={PT + 4} fill="#64748b" fontSize="9" textAnchor="end">{fmt(maxT)} Nm</text>
      <text x={PL - 4} y={toY(0) + 4} fill="#64748b" fontSize="9" textAnchor="end">0</text>

      {/* Operating point label */}
      <text x={opX + 7} y={opY - 6} fill="#f59e0b" fontSize="9">
        {fmt(opT)} Nm
      </text>

      {/* Title */}
      <text x={PL + iw / 2} y={PT + ih / 2 + 4} fill="#1e3a8a" fontSize="9" textAnchor="middle" opacity="0.3">
        Torque–Speed
      </text>
    </svg>
  );
}

// ── Slider component ──────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step, unit,
  onChange, format,
}: {
  label: string; value: number; min: number; max: number;
  step: number; unit: string; onChange: (v: number) => void;
  format?: (v: number) => string;
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
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-400 bg-slate-600 cursor-pointer"
        aria-label={`${label}: ${value} ${unit}`}
      />
    </div>
  );
}

// ── Inline KaTeX helper ───────────────────────────────────────────────────────

function K({ tex }: { tex: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, { throwOnError: false }),
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GearRatioExplorer() {
  const [motorId,     setMotorId]     = useState('kraken-x60-foc');
  const [motorCount,  setMotorCount]  = useState(6);
  const [gearRatio,   setGearRatio]   = useState(6.75);
  const [wheelDiamIn, setWheelDiamIn] = useState(4);
  const [massLbs,     setMassLbs]     = useState(55);
  const [frictionMu,  setFrictionMu]  = useState(0.8);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const startRef   = useRef<number>(0);
  const paramsRef  = useRef<DrivetrainParams | null>(null);

  const motor = MOTORS[motorId];

  const params: DrivetrainParams = {
    motor,
    motorCount,
    gearRatio,
    wheelDiameterM: inToM(wheelDiamIn),
    robotMassKg:    lbsToKg(massLbs),
    frictionCoeff:  frictionMu,
  };

  paramsRef.current = params;

  // Derived values
  const vTop   = topSpeedMps(params);
  const accel  = maxAccelMps2(params);
  const tTotal = traversalTimeS(params, FIELD_DISTANCE_M);
  const trLim  = isTractionLimited(params);
  const mForce = maxMotorForceN(params);
  const tForce = maxTractionForceN(params);

  // Motor RPM at top speed (for operating point on curve)
  const opMotorRPM = motor.freeSpeedRPM; // at free speed = top speed

  // Canvas animation
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const p = paramsRef.current;
    if (!canvas || !p) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (startRef.current === 0) startRef.current = timestamp;
    const elapsed  = (timestamp - startRef.current) / 1000;
    const tTotal   = traversalTimeS(p, FIELD_DISTANCE_M);
    const loopDur  = tTotal + 0.8;
    const t        = elapsed % loopDur;
    const pos      = t < tTotal ? positionAtTimeM(p, t) : FIELD_DISTANCE_M;
    const fraction = Math.min(pos / FIELD_DISTANCE_M, 1);

    const v    = topSpeedMps(p);
    const vFps = round(mpsToFps(v), 1);

    drawField(ctx, fraction, `${vFps} ft/s top speed · ${round(tTotal, 2)}s to traverse ${FIELD_DISTANCE_FT} ft`);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  // Reset animation whenever params change
  useEffect(() => {
    startRef.current = 0;
    cancelAnimationFrame(animRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width  = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [motorId, motorCount, gearRatio, wheelDiamIn, massLbs, frictionMu, animate]);

  // ── Live equation strings
  const latexEq = String.raw`v_{top} = \frac{\omega_{free}}{GR \cdot 60} \times \pi d = \frac{${motor.freeSpeedRPM}}{${round(gearRatio,2)} \times 60} \times \pi \times ${round(inToM(wheelDiamIn),4)} = ${round(vTop,2)} \text{ m/s}`;

  return (
    <div className="space-y-5 text-slate-200">
      {/* Field animation */}
      <div className="rounded-lg overflow-hidden bg-sim-bg border border-sim-border">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', maxWidth: CANVAS_W }}
          aria-label="Robot traversing the field animation"
        />
      </div>

      {/* Controls + stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Parameters
          </div>

          {/* Motor selector */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Motor</label>
            <select
              value={motorId}
              onChange={(e) => setMotorId(e.target.value)}
              className="w-full bg-sim-panel border border-sim-border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
            >
              {MOTOR_LIST.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <Slider label="Gear ratio" value={gearRatio} min={2} max={20} step={0.05}
            unit=":1" format={(v) => v.toFixed(2)} onChange={setGearRatio} />

          <Slider label="Wheel diameter" value={wheelDiamIn} min={2} max={8} step={0.25}
            unit="in" onChange={setWheelDiamIn} />

          <Slider label="Drive motors" value={motorCount} min={2} max={8} step={2}
            unit="" onChange={setMotorCount} />

          <Slider label="Robot mass" value={massLbs} min={20} max={125} step={1}
            unit="lbs" onChange={setMassLbs} />

          <Slider label="Friction coefficient (μ)" value={frictionMu} min={0.4} max={1.2} step={0.05}
            unit="" format={(v) => v.toFixed(2)} onChange={setFrictionMu} />
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Results
          </div>

          <StatRow label="Top speed"
            value={`${round(mpsToFps(vTop), 1)} ft/s`}
            sub={`${round(vTop, 2)} m/s`}
            color="text-sim-accent"
          />
          <StatRow label="Max acceleration"
            value={`${round(accel, 2)} m/s²`}
            sub={`${round(accel / 9.81, 2)}g`}
            color="text-sim-ok"
          />
          <StatRow label={`Time to cross ${FIELD_DISTANCE_FT} ft`}
            value={`${round(tTotal, 2)} s`}
            color="text-white"
          />
          <StatRow label="Max motor force"
            value={`${round(mForce, 0)} N`}
            color={trLim ? 'text-sim-danger' : 'text-sim-ok'}
          />
          <StatRow label="Traction limit"
            value={`${round(tForce, 0)} N`}
            color="text-slate-300"
          />

          {trLim ? (
            <div className="rounded-lg bg-amber-950 border border-amber-700 p-3 text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold">Traction-limited.</span> Motor force (
              {round(mForce, 0)} N) exceeds grip ({round(tForce, 0)} N) — wheels will
              spin out. Acceleration is limited by friction, not the motor. Increase robot
              weight, softer tires (higher μ), or lower the gear ratio.
            </div>
          ) : (
            <div className="rounded-lg bg-green-950 border border-green-800 p-3 text-xs text-green-300 leading-relaxed">
              <span className="font-semibold">Motor-limited.</span> Traction is sufficient.
              Acceleration is limited by motor torque. You can increase the gear ratio for
              more torque (at the cost of top speed) without losing grip.
            </div>
          )}

          {/* Motor curve */}
          <div>
            <div className="text-xs text-slate-500 mb-1.5">Motor torque–speed (operating point ◆)</div>
            <MotorCurve params={params} motorRPM={opMotorRPM} />
          </div>
        </div>
      </div>

      {/* Live equation */}
      <div className="rounded-lg bg-sim-panel border border-sim-border p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Live equation
        </div>
        <div
          className="overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(latexEq, { throwOnError: false, displayMode: true }),
          }}
        />
        <div className="mt-3 text-xs text-slate-500">
          Where <K tex="\omega_{free}" /> = motor free speed (RPM), <K tex="GR" /> = gear
          ratio, <K tex="d" /> = wheel diameter (m). Divide by 60 to convert RPM → RPS,
          then multiply by circumference <K tex="\pi d" />.
        </div>
      </div>
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
