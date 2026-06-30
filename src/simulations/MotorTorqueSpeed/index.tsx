import { useState } from 'react';
import katex from 'katex';
import {
  MOTOR_SPECS,
  curvePoints,
  currentAtOutputRPM,
  operatingPointRPM,
  outputPowerW,
  outputTorqueAtRPM,
} from './physics';

// ── SVG chart dimensions ──────────────────────────────────────────────────────

const VW  = 500;
const VH  = 280;
const PL  = 56;  // left padding (y-axis labels)
const PR  = 20;
const PT  = 16;
const PB  = 40;  // bottom (x-axis labels)
const CW  = VW - PL - PR;
const CH  = VH - PT - PB;

// ── Slider ────────────────────────────────────────────────────────────────────

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

// ── Chart SVG ─────────────────────────────────────────────────────────────────

function TorqueSpeedChart({
  motorId, gearRatio, loadTorque,
}: {
  motorId: string; gearRatio: number; loadTorque: number;
}) {
  const motor = MOTOR_SPECS.find((m) => m.id === motorId) ?? MOTOR_SPECS[0];
  const pts   = curvePoints(motor, gearRatio);

  const maxRPM    = motor.freeSpeedRPM / gearRatio;
  const maxTorque = motor.stallTorqueNm * gearRatio;
  const maxPower  = motor.stallTorqueNm * motor.freeSpeedRPM * Math.PI / (2 * 30); // peak power W

  const toX = (rpm: number)    => PL + (rpm / maxRPM) * CW;
  const toY = (torque: number) => PT + CH - (torque / (maxTorque * 1.05)) * CH;
  const toYP = (pw: number)    => PT + CH - (pw / (maxPower * 1.05)) * CH;

  // Torque curve path
  const torquePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.rpm).toFixed(1)},${toY(p.torque).toFixed(1)}`)
    .join(' ');

  // Power curve path
  const powerPath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.rpm).toFixed(1)},${toYP(p.power).toFixed(1)}`)
    .join(' ');

  // Operating point
  const opRPM = operatingPointRPM(motor, loadTorque, gearRatio);
  const opX   = opRPM != null ? toX(opRPM) : null;
  const opY   = opRPM != null ? toY(loadTorque) : null;

  // Operating point color: red if stalled/near stall, yellow if < 30% free speed, green otherwise
  let opColor = '#4ade80';
  if (opRPM == null) {
    opColor = '#f87171';
  } else {
    const frac = opRPM / maxRPM;
    if (frac < 0.10) opColor = '#f87171';
    else if (frac < 0.30) opColor = '#f59e0b';
  }

  // Grid lines
  const rpmTicks = [0.25, 0.5, 0.75, 1.0].map((f) => f * maxRPM);
  const torqueTicks = [0.25, 0.5, 0.75, 1.0].map((f) => f * maxTorque);

  const fmtRPM = (r: number) => r >= 1000 ? `${(r / 1000).toFixed(1)}k` : r.toFixed(0);
  const fmtT   = (t: number) => t.toFixed(0);

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="Motor torque-speed curve">
      {/* Background */}
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* Grid lines */}
      {rpmTicks.map((r) => (
        <line key={`gr${r}`} x1={toX(r)} y1={PT} x2={toX(r)} y2={PT + CH}
          stroke="#1e293b" strokeWidth="1" />
      ))}
      {torqueTicks.map((t) => (
        <line key={`gt${t}`} x1={PL} y1={toY(t)} x2={PL + CW} y2={toY(t)}
          stroke="#1e293b" strokeWidth="1" />
      ))}

      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + CH} stroke="#334155" strokeWidth="1.5" />
      <line x1={PL} y1={PT + CH} x2={PL + CW} y2={PT + CH} stroke="#334155" strokeWidth="1.5" />

      {/* Power curve (dashed, orange) */}
      <path d={powerPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7" />

      {/* Torque curve (solid, sky blue) */}
      <path d={torquePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

      {/* Load line (horizontal red) */}
      {loadTorque > 0 && (
        <line
          x1={PL} y1={toY(loadTorque)}
          x2={PL + CW} y2={toY(loadTorque)}
          stroke="#f87171" strokeWidth="1.5" strokeDasharray="6,3"
        />
      )}
      {loadTorque > 0 && (
        <text x={PL + CW - 4} y={toY(loadTorque) - 4}
          fill="#f87171" fontSize="9" textAnchor="end">
          load {loadTorque.toFixed(1)} N·m
        </text>
      )}

      {/* Operating point */}
      {opX != null && opY != null && (
        <>
          <line x1={opX} y1={PT} x2={opX} y2={PT + CH}
            stroke={`${opColor}44`} strokeWidth="1" strokeDasharray="3,2" />
          <circle cx={opX} cy={opY} r="6" fill={opColor} />
          <text x={opX + 9} y={opY - 6} fill={opColor} fontSize="9">
            {fmtRPM(opRPM!)} RPM
          </text>
        </>
      )}

      {/* Axis tick labels */}
      {rpmTicks.map((r) => (
        <text key={`lt${r}`} x={toX(r)} y={PT + CH + 14}
          fill="#475569" fontSize="9" textAnchor="middle">{fmtRPM(r)}</text>
      ))}
      <text x={PL} y={PT + CH + 14} fill="#475569" fontSize="9" textAnchor="middle">0</text>
      {torqueTicks.map((t) => (
        <text key={`lto${t}`} x={PL - 6} y={toY(t) + 4}
          fill="#475569" fontSize="9" textAnchor="end">{fmtT(t)}</text>
      ))}

      {/* Axis labels */}
      <text x={PL + CW / 2} y={VH - 4}
        fill="#64748b" fontSize="10" textAnchor="middle">Output shaft speed (RPM)</text>
      <text
        transform={`rotate(-90) translate(${-(PT + CH / 2)}, ${PL - 44})`}
        fill="#64748b" fontSize="10" textAnchor="middle">Output torque (N·m)</text>

      {/* Legend */}
      <line x1={PL + 8} y1={PT + 10} x2={PL + 24} y2={PT + 10} stroke="#38bdf8" strokeWidth="2.5" />
      <text x={PL + 28} y={PT + 14} fill="#38bdf8" fontSize="9">Torque</text>
      <line x1={PL + 68} y1={PT + 10} x2={PL + 84} y2={PT + 10}
        stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7" />
      <text x={PL + 88} y={PT + 14} fill="#f59e0b" fontSize="9" opacity="0.7">Power</text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MotorTorqueSpeed() {
  const [motorId,    setMotorId]    = useState('kraken');
  const [gearRatio,  setGearRatio]  = useState(10);
  const [loadPct,    setLoadPct]    = useState(30); // % of stall torque

  const motor = MOTOR_SPECS.find((m) => m.id === motorId) ?? MOTOR_SPECS[0];

  const maxOutputTorque = motor.stallTorqueNm * gearRatio;
  const loadTorque      = (loadPct / 100) * maxOutputTorque;
  const opRPM           = operatingPointRPM(motor, loadTorque, gearRatio);
  const opCurrent       = opRPM != null ? currentAtOutputRPM(motor, opRPM, gearRatio) : motor.stallCurrentA;
  const opPower         = opRPM != null ? outputPowerW(motor, opRPM, gearRatio) : 0;
  const opTorque        = opRPM != null ? outputTorqueAtRPM(motor, opRPM, gearRatio) : maxOutputTorque;
  const freeOutRPM      = motor.freeSpeedRPM / gearRatio;

  // Operating point color classification
  let opStatus = 'Healthy';
  let opStatusColor = 'text-sim-ok';
  if (opRPM == null) { opStatus = 'Stalled'; opStatusColor = 'text-sim-danger'; }
  else if (opRPM / freeOutRPM < 0.10) { opStatus = 'Near stall'; opStatusColor = 'text-sim-danger'; }
  else if (opRPM / freeOutRPM < 0.30) { opStatus = 'High load'; opStatusColor = 'text-sim-warn'; }

  const brownoutRisk = opCurrent > 200;

  const latexEq = String.raw`\tau_{out}(\omega) = \tau_{stall} \cdot GR \cdot \left(1 - \frac{\omega}{\omega_{free}/GR}\right) = ${motor.stallTorqueNm}\times${gearRatio}\left(1-\frac{\omega}{${freeOutRPM.toFixed(0)}}\right)`;

  return (
    <div className="space-y-5 text-slate-200">
      {/* Chart */}
      <div className="rounded-lg overflow-hidden border border-sim-border">
        <TorqueSpeedChart motorId={motorId} gearRatio={gearRatio} loadTorque={loadTorque} />
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
              {MOTOR_SPECS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.stallTorqueNm} N·m stall, {m.freeSpeedRPM.toLocaleString()} RPM
                </option>
              ))}
            </select>
          </div>

          <Slider label="Gear ratio" value={gearRatio} min={1} max={100} step={1}
            unit=":1" onChange={setGearRatio} />

          <Slider
            label="Load torque"
            value={loadPct} min={0} max={100} step={1}
            unit="%"
            format={(v) => `${v}% of stall (${((v / 100) * maxOutputTorque).toFixed(1)} N·m)`}
            onChange={setLoadPct}
          />
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Operating Point
          </div>

          <StatRow
            label="Output free speed"
            value={`${freeOutRPM.toFixed(0)} RPM`}
            sub={`${motor.freeSpeedRPM.toLocaleString()} / ${gearRatio}`}
            color="text-sim-accent"
          />
          <StatRow
            label="Output stall torque"
            value={`${maxOutputTorque.toFixed(1)} N·m`}
            sub={`${motor.stallTorqueNm} × ${gearRatio}`}
            color="text-sim-accent"
          />
          <StatRow
            label="Operating speed"
            value={opRPM != null ? `${opRPM.toFixed(0)} RPM` : 'STALLED'}
            color={opStatusColor}
          />
          <StatRow
            label="Output torque at op. point"
            value={`${opTorque.toFixed(2)} N·m`}
            color="text-slate-300"
          />
          <StatRow
            label="Motor current"
            value={`${opCurrent.toFixed(0)} A`}
            color={brownoutRisk ? 'text-sim-danger' : 'text-sim-ok'}
          />
          <StatRow
            label="Mechanical power"
            value={`${opPower.toFixed(0)} W`}
            color="text-slate-300"
          />
          <StatRow
            label="Status"
            value={opStatus}
            color={opStatusColor}
          />

          {brownoutRisk ? (
            <div className="rounded-lg bg-red-950 border border-red-800 p-3 text-xs text-red-300 leading-relaxed">
              <span className="font-semibold">Brownout risk.</span> Current draw of{' '}
              {opCurrent.toFixed(0)} A will cause significant battery voltage sag. Set
              current limits in code or reduce load.
            </div>
          ) : opRPM != null && opRPM / freeOutRPM < 0.30 ? (
            <div className="rounded-lg bg-amber-950 border border-amber-700 p-3 text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold">High load region.</span> Motor is running
              slow and drawing high current. Consider a higher gear ratio to shift the
              operating point toward free speed.
            </div>
          ) : (
            <div className="rounded-lg bg-green-950 border border-green-800 p-3 text-xs text-green-300 leading-relaxed">
              <span className="font-semibold">Good operating point.</span> Motor is
              running efficiently. Current draw is manageable.
            </div>
          )}
        </div>
      </div>

      {/* Live equation */}
      <div className="rounded-lg bg-sim-panel border border-sim-border p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Output curve equation
        </div>
        <div
          className="overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(latexEq, { throwOnError: false, displayMode: true }),
          }}
        />
        <div className="mt-2 text-xs text-slate-500">
          The curve is linear from (0, τ_stall·GR) to (ω_free/GR, 0). Peak mechanical
          power occurs at half the free speed. The gear ratio trades speed for torque but
          does not change peak power (assuming 100% efficiency).
        </div>
      </div>
    </div>
  );
}
