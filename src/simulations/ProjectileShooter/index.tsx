import { useState } from 'react';
import katex from 'katex';
import { arcPoints, checkShot, exitVelocityToMotorRPM, projectilePos, timeAtHeight } from './physics';

// ── SVG coordinate system ─────────────────────────────────────────────────────
// viewBox: 0 0 500 220
// Physical world: x in [0, ~12m], y in [0, ~5m]
// SVG: origin bottom-left, x right, y inverted (SVG y increases down)

const VW = 500;
const VH = 220;
const PAD_L = 40;
const PAD_R = 40;
const PAD_B = 30; // ground line y in SVG
const PAD_T = 15;
const PLOT_W = VW - PAD_L - PAD_R;
const PLOT_H = VH - PAD_B - PAD_T;

const WORLD_W = 12; // meters shown on x-axis
const WORLD_H = 5;  // meters shown on y-axis

function toSvgX(xM: number) {
  return PAD_L + (xM / WORLD_W) * PLOT_W;
}
function toSvgY(yM: number) {
  return VH - PAD_B - (yM / WORLD_H) * PLOT_H;
}

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

// ── Trajectory SVG ────────────────────────────────────────────────────────────

function TrajectorySVG({
  angleDeg, h0, targetDist, targetHeight,
  hit, arcPts, xAtHeight, missM,
}: {
  angleDeg: number; h0: number;
  targetDist: number; targetHeight: number;
  hit: boolean; arcPts: Array<{ x: number; y: number }>;
  xAtHeight: number; missM: number;
}) {
  const arcColor = hit ? '#4ade80' : '#f97316';

  // Build SVG path from arc points
  const validPts = arcPts.filter((p) => p.x >= 0 && p.x <= WORLD_W && p.y >= 0);
  const pathD = validPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`)
    .join(' ');

  // Target box (speaker-style opening)
  const targetW = 0.55; // m
  const targetH = 0.4;  // m visual height
  const tx = toSvgX(targetDist - targetW / 2);
  const ty = toSvgY(targetHeight + targetH / 2);
  const tw = (targetW / WORLD_W) * PLOT_W;
  const th = (targetH / WORLD_H) * PLOT_H;

  // Robot launcher
  const robotX = toSvgX(0);
  const groundY = toSvgY(0);
  const launchY = toSvgY(h0);
  const launchX = toSvgX(0) + 18;

  // Impact dot (where arc is at target height)
  const impactX = toSvgX(xAtHeight);
  const impactY = toSvgY(targetHeight);

  // Grid lines (every 2m horizontal, every 1m vertical)
  const gridXs = [2, 4, 6, 8, 10];
  const gridYs = [1, 2, 3, 4];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" aria-label="Projectile trajectory">
      {/* Background */}
      <rect width={VW} height={VH} fill="#0f172a" rx="8" />

      {/* Grid */}
      {gridXs.map((x) => (
        <line key={`gx${x}`} x1={toSvgX(x)} y1={PAD_T} x2={toSvgX(x)} y2={VH - PAD_B}
          stroke="#1e293b" strokeWidth="1" />
      ))}
      {gridYs.map((y) => (
        <line key={`gy${y}`} x1={PAD_L} y1={toSvgY(y)} x2={VW - PAD_R} y2={toSvgY(y)}
          stroke="#1e293b" strokeWidth="1" />
      ))}

      {/* Ground */}
      <line x1={PAD_L} y1={groundY} x2={VW - PAD_R} y2={groundY}
        stroke="#334155" strokeWidth="2" />

      {/* Axis labels */}
      {gridXs.map((x) => (
        <text key={`lx${x}`} x={toSvgX(x)} y={VH - 8}
          fill="#475569" fontSize="9" textAnchor="middle">{x}m</text>
      ))}
      {gridYs.map((y) => (
        <text key={`ly${y}`} x={PAD_L - 6} y={toSvgY(y) + 4}
          fill="#475569" fontSize="9" textAnchor="end">{y}m</text>
      ))}

      {/* Robot body */}
      <rect x={robotX - 4} y={groundY - 34} width={22} height={34} fill="#1e40af" rx="2" />
      <rect x={robotX - 4} y={groundY - 34} width={22} height={5} fill="#1d4ed8" />
      <rect x={robotX - 4} y={groundY - 5} width={22} height={5} fill="#1d4ed8" />

      {/* Shooter barrel */}
      <line
        x1={launchX} y1={launchY}
        x2={launchX + 12 * Math.cos((angleDeg * Math.PI) / 180)}
        y2={launchY - 12 * Math.sin((angleDeg * Math.PI) / 180)}
        stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"
      />

      {/* Trajectory arc */}
      {pathD && (
        <path d={pathD} fill="none" stroke={arcColor} strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Target (speaker box) */}
      <rect x={tx} y={ty} width={tw} height={th} fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="2" />
      {/* Opening */}
      <rect x={tx + 2} y={ty + 2} width={tw - 4} height={th / 2 - 2}
        fill={hit ? '#14532d' : '#1a1a1a'} rx="1" />
      <text x={tx + tw / 2} y={ty + th + 12} fill="#64748b" fontSize="9" textAnchor="middle">
        target
      </text>
      {/* Target height line */}
      <line x1={PAD_L} y1={toSvgY(targetHeight)} x2={tx}
        y2={toSvgY(targetHeight)} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

      {/* Impact dot */}
      {isFinite(xAtHeight) && xAtHeight > 0 && (
        <>
          <circle cx={impactX} cy={impactY} r="5"
            fill={hit ? '#4ade80' : '#f97316'} />
          {!hit && Math.abs(missM) < 3 && (
            <text x={impactX + 8} y={impactY - 6} fill="#f97316" fontSize="9">
              {missM > 0 ? '+' : ''}{missM.toFixed(2)}m
            </text>
          )}
        </>
      )}

      {/* Hit/miss banner */}
      <rect x={PAD_L + 4} y={PAD_T + 4} width={90} height={20} rx="4"
        fill={hit ? '#14532d' : '#7c2d12'} />
      <text x={PAD_L + 49} y={PAD_T + 17}
        fill={hit ? '#4ade80' : '#f97316'}
        fontSize="10" fontWeight="bold" textAnchor="middle">
        {hit ? '✓ HIT' : `✗ MISS ${missM > 0 ? 'long' : 'short'} ${Math.abs(missM).toFixed(2)}m`}
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectileShooter() {
  const [v0,           setV0]          = useState(12);
  const [angleDeg,     setAngleDeg]    = useState(35);
  const [h0,           setH0]          = useState(0.5);
  const [targetDist,   setTargetDist]  = useState(6);
  const [targetHeight, setTargetHeight] = useState(2.0);
  const [wheelDiamM,   setWheelDiamM]  = useState(0.1016); // 4 inch in meters
  const [gearRatio,    setGearRatio]   = useState(1);

  // Physics
  const pts    = arcPoints(v0, angleDeg, h0);
  const result = checkShot(v0, angleDeg, h0, targetDist, targetHeight);
  const motorRPM = exitVelocityToMotorRPM(v0, wheelDiamM, gearRatio);
  const flightT = timeAtHeight(v0, angleDeg, h0, targetHeight);

  // Derived position at target height
  const posAtTarget = flightT != null ? projectilePos(v0, angleDeg, h0, flightT) : null;

  const latexEq = String.raw`x(t)=${v0.toFixed(1)}\cos(${angleDeg}°)\cdot t,\quad y(t)=${h0.toFixed(1)}+${v0.toFixed(1)}\sin(${angleDeg}°)\cdot t - \tfrac{1}{2}(9.81)t^2`;

  return (
    <div className="space-y-5 text-slate-200">
      {/* SVG visualization */}
      <div className="rounded-lg overflow-hidden border border-sim-border">
        <TrajectorySVG
          angleDeg={angleDeg} h0={h0}
          targetDist={targetDist} targetHeight={targetHeight}
          hit={result.hit} arcPts={pts}
          xAtHeight={result.xAtHeight} missM={result.missM}
        />
      </div>

      {/* Controls + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Shooter Parameters
          </div>
          <Slider label="Exit velocity" value={v0} min={5} max={25} step={0.5}
            unit="m/s" format={(v) => v.toFixed(1)} onChange={setV0} />
          <Slider label="Launch angle" value={angleDeg} min={0} max={80} step={1}
            unit="°" onChange={setAngleDeg} />
          <Slider label="Launch height" value={h0} min={0.2} max={1.5} step={0.05}
            unit="m" format={(v) => v.toFixed(2)} onChange={setH0} />

          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 pt-1">
            Target
          </div>
          <Slider label="Target distance" value={targetDist} min={2} max={10} step={0.25}
            unit="m" format={(v) => v.toFixed(2)} onChange={setTargetDist} />
          <Slider label="Target height" value={targetHeight} min={0.5} max={4} step={0.1}
            unit="m" format={(v) => v.toFixed(1)} onChange={setTargetHeight} />

          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 pt-1">
            Wheel / Motor
          </div>
          <Slider label="Wheel diameter" value={wheelDiamM * 1000} min={50} max={150} step={5}
            unit="mm" format={(v) => v.toFixed(0)}
            onChange={(v) => setWheelDiamM(v / 1000)} />
          <Slider label="Gear ratio (motor:wheel)" value={gearRatio} min={1} max={6} step={0.25}
            unit=":1" format={(v) => v.toFixed(2)} onChange={setGearRatio} />
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Results
          </div>

          <StatRow label="Exit velocity" value={`${v0.toFixed(1)} m/s`} color="text-sim-accent" />
          <StatRow
            label="Horiz. range at target height"
            value={posAtTarget ? `${posAtTarget.x.toFixed(2)} m` : 'never reaches'}
            color={result.hit ? 'text-sim-ok' : 'text-sim-danger'}
          />
          <StatRow
            label="Miss distance"
            value={isFinite(result.missM) ? `${result.missM.toFixed(3)} m` : '—'}
            color={result.hit ? 'text-sim-ok' : 'text-sim-danger'}
          />
          <StatRow
            label="Required wheel RPM"
            value={`${Math.round(motorRPM / gearRatio)}`}
            sub="at wheel shaft"
            color="text-slate-300"
          />
          <StatRow
            label="Required motor RPM"
            value={`${Math.round(motorRPM)}`}
            sub={`× ${gearRatio.toFixed(2)} gear ratio`}
            color="text-sim-accent"
          />

          {result.hit ? (
            <div className="rounded-lg bg-green-950 border border-green-800 p-3 text-xs text-green-300 leading-relaxed">
              <span className="font-semibold">Shot hits target.</span> At {v0} m/s,{' '}
              {angleDeg}° the ball reaches {targetDist} m and passes through the
              {targetHeight} m opening. Motor needs {Math.round(motorRPM)} RPM.
            </div>
          ) : (
            <div className="rounded-lg bg-amber-950 border border-amber-700 p-3 text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold">Shot misses.</span>{' '}
              {isFinite(result.missM)
                ? `Ball arrives ${Math.abs(result.missM).toFixed(2)} m ${result.missM > 0 ? 'past' : 'short of'} the target. Adjust angle or exit velocity.`
                : 'Ball never reaches target height. Increase exit velocity or reduce angle.'}
            </div>
          )}
        </div>
      </div>

      {/* Live equation */}
      <div className="rounded-lg bg-sim-panel border border-sim-border p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Live equations
        </div>
        <div
          className="overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(latexEq, { throwOnError: false, displayMode: true }),
          }}
        />
        <div className="mt-2 text-xs text-slate-500">
          Horizontal: constant velocity. Vertical: constant deceleration at 9.81 m/s².
          Find t when y(t) = target height, then check x(t) = target distance.
        </div>
      </div>
    </div>
  );
}
