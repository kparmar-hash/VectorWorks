import { useState } from 'react';
import katex from 'katex';
import {
  gravityTorqueNm,
  outputTorqueCapacityNm,
  safetyMarginRatio,
} from './physics';

// ── Motor presets ─────────────────────────────────────────────────────────────

const MOTORS = [
  { id: 'neo',     name: 'REV NEO',     stallTorqueNm: 3.28 },
  { id: 'falcon',  name: 'Falcon 500',  stallTorqueNm: 4.69 },
  { id: 'kraken',  name: 'Kraken X60',  stallTorqueNm: 9.37 },
  { id: 'vortex',  name: 'NEO Vortex',  stallTorqueNm: 3.60 },
];

// ── SVG constants ─────────────────────────────────────────────────────────────

const VW = 380;
const VH = 240;
const PIVOT_X = 100;
const PIVOT_Y = 130;
const ARM_PX = 150; // fixed pixel length of arm in SVG

// ── Slider ───────────────────────────────────────────────────────────────────

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

// ── Arm SVG ───────────────────────────────────────────────────────────────────

function ArmSVG({
  angleDeg, massKg, lengthM, canHold, gravTorque,
}: {
  angleDeg: number; massKg: number; lengthM: number; canHold: boolean; gravTorque: number;
}) {
  const rad = (angleDeg * Math.PI) / 180;
  // SVG y-axis is inverted: positive y = down
  const tipX = PIVOT_X + ARM_PX * Math.cos(rad);
  const tipY = PIVOT_Y - ARM_PX * Math.sin(rad);
  const comX = PIVOT_X + (ARM_PX / 2) * Math.cos(rad);
  const comY = PIVOT_Y - (ARM_PX / 2) * Math.sin(rad);

  // Gravity vector length scales with torque magnitude (max ~40px at full horizontal)
  const gravLen = 36;
  const armColor = canHold ? '#4ade80' : '#f87171';

  // Arc for angle indicator
  const arcR = 36;
  const arcEndX = PIVOT_X + arcR * Math.cos(rad);
  const arcEndY = PIVOT_Y - arcR * Math.sin(rad);
  const largeArc = angleDeg > 180 ? 1 : 0;
  const sweepDir = angleDeg >= 0 ? 0 : 1;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="Arm torque visualization">
      {/* Background */}
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* Ground line */}
      <line x1={20} y1={PIVOT_Y + 70} x2={VW - 20} y2={PIVOT_Y + 70}
        stroke="#334155" strokeWidth="2" />
      <text x={VW / 2} y={PIVOT_Y + 85} fill="#475569" fontSize="10" textAnchor="middle">
        ground
      </text>

      {/* Wall / mounting bracket */}
      <rect x={20} y={PIVOT_Y - 50} width={16} height={100} fill="#1e293b" rx="3" />
      {[0, 20, 40, 60, 80].map((dy) => (
        <line key={dy} x1={20} y1={PIVOT_Y - 50 + dy} x2={10} y2={PIVOT_Y - 40 + dy}
          stroke="#334155" strokeWidth="1.5" />
      ))}
      <rect x={30} y={PIVOT_Y - 6} width={10} height={12} fill="#475569" rx="2" />

      {/* Angle arc indicator */}
      <path
        d={`M ${PIVOT_X + arcR} ${PIVOT_Y} A ${arcR} ${arcR} 0 ${largeArc} ${sweepDir} ${arcEndX} ${arcEndY}`}
        fill="none" stroke="#38bdf844" strokeWidth="1.5"
      />
      <text
        x={PIVOT_X + arcR * Math.cos(rad / 2) + 10}
        y={PIVOT_Y - arcR * Math.sin(rad / 2) + 4}
        fill="#38bdf8" fontSize="10"
      >
        {angleDeg.toFixed(0)}°
      </text>

      {/* Arm */}
      <line
        x1={PIVOT_X} y1={PIVOT_Y} x2={tipX} y2={tipY}
        stroke={armColor} strokeWidth="8" strokeLinecap="round"
      />

      {/* Center of mass marker */}
      <circle cx={comX} cy={comY} r="6" fill="#f59e0b" />
      <text x={comX + 10} y={comY - 8} fill="#f59e0b" fontSize="9">CoM</text>

      {/* Gravity vector at CoM */}
      {Math.abs(gravTorque) > 0.05 && (
        <g>
          <line
            x1={comX} y1={comY}
            x2={comX} y2={comY + gravLen}
            stroke="#ef4444" strokeWidth="2"
          />
          <polygon
            points={`${comX},${comY + gravLen + 6} ${comX - 4},${comY + gravLen - 2} ${comX + 4},${comY + gravLen - 2}`}
            fill="#ef4444"
          />
          <text x={comX + 8} y={comY + gravLen / 2 + 4} fill="#ef4444" fontSize="9">
            mg
          </text>
        </g>
      )}

      {/* Pivot */}
      <circle cx={PIVOT_X} cy={PIVOT_Y} r="8" fill="#64748b" />
      <circle cx={PIVOT_X} cy={PIVOT_Y} r="4" fill="#0f172a" />

      {/* Tip */}
      <circle cx={tipX} cy={tipY} r="5" fill={armColor} />

      {/* Hold/stall badge */}
      <rect x={VW - 120} y={10} width={108} height={26} rx="5"
        fill={canHold ? '#14532d' : '#7f1d1d'} />
      <text x={VW - 66} y={28} fill={canHold ? '#4ade80' : '#f87171'}
        fontSize="11" fontWeight="bold" textAnchor="middle">
        {canHold ? '✓ Motor holds' : '✗ Motor stalls'}
      </text>

      {/* Mass label */}
      <text x={VW / 2 + 40} y={PIVOT_Y + 55} fill="#64748b" fontSize="9" textAnchor="middle">
        {massKg.toFixed(1)} kg · {lengthM.toFixed(2)} m arm
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArmTorque() {
  const [angleDeg,  setAngleDeg]  = useState(45);
  const [massKg,    setMassKg]    = useState(2.0);
  const [lengthM,   setLengthM]   = useState(0.6);
  const [gearRatio, setGearRatio] = useState(40);
  const [motorId,   setMotorId]   = useState('neo');

  const motor = MOTORS.find((m) => m.id === motorId) ?? MOTORS[0];

  // Physics
  const gravTorque = gravityTorqueNm(massKg, lengthM, angleDeg);
  const capacity   = outputTorqueCapacityNm(motor.stallTorqueNm, gearRatio);
  const margin     = safetyMarginRatio(capacity, Math.abs(gravTorque));
  const canHold    = margin >= 1.0;

  // Live LaTeX equation
  const latexEq = String.raw`\tau_{gravity} = ${massKg.toFixed(1)} \times 9.81 \times ${lengthM.toFixed(2)} \times \cos(${angleDeg}°) = ${gravTorque.toFixed(2)}\text{ N·m}`;

  const fmt2 = (n: number) => Math.abs(n) < 0.001 ? '0.00' : n.toFixed(2);

  return (
    <div className="space-y-5 text-slate-200">
      {/* SVG Visualization */}
      <div className="rounded-lg overflow-hidden border border-sim-border">
        <ArmSVG
          angleDeg={angleDeg}
          massKg={massKg}
          lengthM={lengthM}
          canHold={canHold}
          gravTorque={gravTorque}
        />
      </div>

      {/* Controls + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Parameters
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Motor</label>
            <select
              value={motorId}
              onChange={(e) => setMotorId(e.target.value)}
              className="w-full bg-sim-panel border border-sim-border rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-400"
            >
              {MOTORS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.stallTorqueNm} N·m stall)
                </option>
              ))}
            </select>
          </div>

          <Slider label="Arm angle" value={angleDeg} min={-90} max={180} step={1}
            unit="°" onChange={setAngleDeg} />

          <Slider label="Arm / payload mass" value={massKg} min={0.5} max={5} step={0.1}
            unit="kg" format={(v) => v.toFixed(1)} onChange={setMassKg} />

          <Slider label="Arm length (pivot to CoM)" value={lengthM} min={0.2} max={1.2} step={0.05}
            unit="m" format={(v) => v.toFixed(2)} onChange={setLengthM} />

          <Slider label="Gear ratio" value={gearRatio} min={5} max={100} step={1}
            unit=":1" onChange={setGearRatio} />
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Results
          </div>

          <StatRow
            label="Gravity torque (at arm)"
            value={`${fmt2(Math.abs(gravTorque))} N·m`}
            color="text-sim-accent"
          />
          <StatRow
            label="Motor torque needed"
            value={`${fmt2(Math.abs(gravTorque) / gearRatio)} N·m`}
            sub={`at motor shaft`}
            color="text-slate-300"
          />
          <StatRow
            label="Motor stall torque"
            value={`${motor.stallTorqueNm} N·m`}
            color="text-slate-300"
          />
          <StatRow
            label="Output capacity"
            value={`${(motor.stallTorqueNm * gearRatio).toFixed(1)} N·m`}
            sub={`stall × ${gearRatio}:1`}
            color="text-slate-300"
          />
          <StatRow
            label="Safety margin"
            value={isFinite(margin) ? `${margin.toFixed(2)}×` : '∞'}
            color={canHold ? 'text-sim-ok' : 'text-sim-danger'}
          />

          {canHold ? (
            <div className="rounded-lg bg-green-950 border border-green-800 p-3 text-xs text-green-300 leading-relaxed">
              <span className="font-semibold">Motor holds position.</span> Output torque
              ({(motor.stallTorqueNm * gearRatio).toFixed(1)} N·m) exceeds gravity torque
              ({fmt2(Math.abs(gravTorque))} N·m) by {((margin - 1) * 100).toFixed(0)}%.
            </div>
          ) : (
            <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-xs text-red-300 leading-relaxed">
              <span className="font-semibold">Motor stalls.</span> Need{' '}
              {fmt2(Math.abs(gravTorque))} N·m but only have{' '}
              {(motor.stallTorqueNm * gearRatio).toFixed(1)} N·m. Increase gear ratio or
              use a higher-torque motor.
            </div>
          )}
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
        <div className="mt-2 text-xs text-slate-500">
          Torque is maximum at 0° (horizontal) and zero at ±90° (vertical). The motor must
          supply this divided by the gear ratio at its own shaft.
        </div>
      </div>
    </div>
  );
}
