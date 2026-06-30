import { useState, useMemo } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const L = 0.6; // robot length (m)
const W = 0.6; // robot width  (m)

// Module positions relative to robot center (m)
const MODULE_POS = [
  { id: 'FL', rx:  L / 2, ry:  W / 2 },
  { id: 'FR', rx:  L / 2, ry: -W / 2 },
  { id: 'BL', rx: -L / 2, ry:  W / 2 },
  { id: 'BR', rx: -L / 2, ry: -W / 2 },
];

// SVG layout — top-down 320×320 view
const CX = 160, CY = 160; // SVG center
const SCALE = 110;         // px per metre (robot is 0.6 m → 66 px per half)
const HALF_W = W / 2 * SCALE; // 33 px
const HALF_L = L / 2 * SCALE; // 33 px

// In SVG, +Y is down; robot +Y is left. Map robot X→SVG Y(down), robot Y→SVG X
// We display: robot +X = up (forward), robot +Y = left (in field coords)
// SVG: forward (robot +X) → up → svgY = CY - rx*SCALE
//       robot +Y (left)    → left → svgX = CX - ry*SCALE
function toSvg(rx: number, ry: number): [number, number] {
  return [CX - ry * SCALE, CY - rx * SCALE];
}

// Arrow helper
function arrowPts(x1: number, y1: number, x2: number, y2: number, size = 6): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return `${x2},${y2}`;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  return `${x2},${y2} ${x2 - ux * size + px * size * 0.4},${y2 - uy * size + py * size * 0.4} ${x2 - ux * size - px * size * 0.4},${y2 - uy * size - py * size * 0.4}`;
}

// ── Kinematics ────────────────────────────────────────────────────────────────
interface ModuleState {
  id: string;
  angle: number;   // rad, from robot +X axis
  speed: number;   // m/s (raw, before normalisation)
  wx: number;      // robot-frame wheel velocity X
  wy: number;      // robot-frame wheel velocity Y
}

function computeModules(vx: number, vy: number, omega: number): ModuleState[] {
  return MODULE_POS.map(({ id, rx, ry }) => {
    const wx = vx - omega * ry;
    const wy = vy + omega * rx;
    return { id, wx, wy, speed: Math.hypot(wx, wy), angle: Math.atan2(wy, wx) };
  });
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
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className="text-sm font-mono text-sim-accent">
          {format ? format(value) : value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-400 bg-slate-600 cursor-pointer"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SwerveKinematics() {
  const [vx, setVx]         = useState(0.8);
  const [vy, setVy]         = useState(0);
  const [omega, setOmega]   = useState(0);
  const [fieldCentric, setFieldCentric] = useState(false);
  const [heading, setHeading] = useState(0); // degrees, robot heading from field-forward

  // Field-centric: rotate commanded velocity by -heading before IK
  const headingRad = heading * (Math.PI / 180);
  const vxRobot = fieldCentric
    ? vx * Math.cos(-headingRad) - vy * Math.sin(-headingRad)
    : vx;
  const vyRobot = fieldCentric
    ? vx * Math.sin(-headingRad) + vy * Math.cos(-headingRad)
    : vy;

  const modules = useMemo(
    () => computeModules(vxRobot, vyRobot, omega),
    [vxRobot, vyRobot, omega],
  );

  const maxSpeed = Math.max(...modules.map(m => m.speed), 0.001);
  // SVG: robot is rotated by heading in field-centric mode
  const robotRotDeg = fieldCentric ? -heading : 0;

  // Module SVG positions (unrotated; robot group rotates instead)
  const svgModules = MODULE_POS.map((pos, i) => {
    const [mx, my] = toSvg(pos.rx, pos.ry);
    const m = modules[i];
    // Wheel angle: convert robot-frame angle to SVG angle
    // Robot +X → SVG up (−Y), Robot +Y → SVG left (−X)
    // A vector (wx, wy) in robot frame maps to SVG dir (-wy*SCALE, -wx*SCALE)
    const svgAngleDeg = Math.atan2(-m.wx, -m.wy) * (180 / Math.PI);
    const norm = m.speed / maxSpeed;
    const arrowLen = norm * 52;
    // Arrow direction in SVG coords
    const svgDirX = -m.wy / (maxSpeed + 0.0001);
    const svgDirY = -m.wx / (maxSpeed + 0.0001);
    const ax2 = mx + svgDirX * arrowLen;
    const ay2 = my + svgDirY * arrowLen;
    return { id: pos.id, mx, my, svgAngleDeg, arrowLen, ax2, ay2, norm, speed: m.speed };
  });

  // Field-centric: show field-forward vector (always up in SVG = 0,-1)
  const fieldFwdX = CX, fieldFwdY = CY - 60;

  // Presets
  const presets = [
    { label: 'Forward',        vx: 1,   vy: 0,   omega: 0   },
    { label: 'Strafe Right',   vx: 0,   vy: -1,  omega: 0   },
    { label: 'Rotate CW',      vx: 0,   vy: 0,   omega: -2  },
    { label: 'Strafe+Rotate',  vx: 0.7, vy: -0.7,omega: -1.5},
  ];

  return (
    <div className="space-y-5 text-slate-200">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── SVG ── */}
        <div className="flex-shrink-0">
          <svg width={320} height={320} viewBox="0 0 320 320"
            className="rounded-lg bg-sim-bg border border-sim-border block">
            {/* Background */}
            <rect width={320} height={320} fill="#0f172a" rx="8" />

            {/* Crosshair */}
            <line x1={CX} y1={10} x2={CX} y2={310} stroke="#1e293b" strokeWidth="1" />
            <line x1={10} y1={CY} x2={310} y2={CY} stroke="#1e293b" strokeWidth="1" />

            {/* Field-forward indicator (always up) */}
            {fieldCentric && (
              <g>
                <line x1={CX} y1={CY} x2={fieldFwdX} y2={fieldFwdY}
                  stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3" />
                <polygon points={arrowPts(CX, CY, fieldFwdX, fieldFwdY, 6)} fill="#94a3b8" />
                <text x={CX + 6} y={fieldFwdY - 6} fill="#94a3b8" fontSize="9" fontFamily="monospace">field fwd</text>

                {/* Field-frame velocity vector (dashed amber) */}
                {(Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) && (() => {
                  const fvLen = Math.hypot(vx, vy) / maxSpeed * 52;
                  // field +X → up (−Y), field +Y → left (−X)
                  const fdx = -vy / (Math.hypot(vx, vy) + 0.001);
                  const fdy = -vx / (Math.hypot(vx, vy) + 0.001);
                  const fx2 = CX + fdx * fvLen;
                  const fy2 = CY + fdy * fvLen;
                  return (
                    <g>
                      <line x1={CX} y1={CY} x2={fx2} y2={fy2}
                        stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" strokeOpacity="0.6" />
                      <polygon points={arrowPts(CX, CY, fx2, fy2, 5)} fill="#f59e0b" fillOpacity="0.6" />
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Robot group (rotates with heading in field-centric) */}
            <g transform={`rotate(${robotRotDeg}, ${CX}, ${CY})`}>
              {/* Robot body */}
              <rect
                x={CX - HALF_L} y={CY - HALF_W}
                width={HALF_L * 2} height={HALF_W * 2}
                fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4"
              />

              {/* Forward indicator arrow (robot +X = up in SVG group) */}
              <line x1={CX} y1={CY} x2={CX} y2={CY - 28}
                stroke="#64748b" strokeWidth="2" />
              <polygon points={arrowPts(CX, CY, CX, CY - 28, 5)} fill="#64748b" />
              <text x={CX + 4} y={CY - 32} fill="#64748b" fontSize="8" fontFamily="monospace">fwd</text>

              {/* Modules */}
              {svgModules.map(m => (
                <g key={m.id}>
                  {/* Wheel rect */}
                  <rect
                    x={m.mx - 9} y={m.my - 4}
                    width={18} height={8}
                    fill={m.norm < 0.05 ? '#334155' : '#0ea5e9'}
                    stroke={m.norm < 0.05 ? '#475569' : '#38bdf8'}
                    strokeWidth="1.5" rx="2"
                    transform={`rotate(${m.svgAngleDeg}, ${m.mx}, ${m.my})`}
                  />

                  {/* Velocity arrow */}
                  {m.norm > 0.05 && (
                    <g>
                      <line x1={m.mx} y1={m.my} x2={m.ax2} y2={m.ay2}
                        stroke="#fbbf24" strokeWidth="2" />
                      <polygon points={arrowPts(m.mx, m.my, m.ax2, m.ay2, 6)} fill="#fbbf24" />
                    </g>
                  )}

                  {/* Module label */}
                  <text
                    x={m.mx + (m.mx < CX ? -14 : 14)}
                    y={m.my + (m.my < CY ? -10 : 14)}
                    fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {m.id}
                  </text>
                </g>
              ))}
            </g>

            {/* Legend */}
            <g transform="translate(8, 285)">
              <rect x={0} y={0} width={8} height={4} fill="#0ea5e9" rx="1" />
              <text x={11} y={5} fill="#64748b" fontSize="8" fontFamily="monospace">wheel</text>
              <line x1={55} y1={2} x2={65} y2={2} stroke="#fbbf24" strokeWidth="2" />
              <text x={68} y={5} fill="#64748b" fontSize="8" fontFamily="monospace">velocity</text>
              {fieldCentric && (
                <>
                  <line x1={120} y1={2} x2={130} y2={2} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
                  <text x={133} y={5} fill="#64748b" fontSize="8" fontFamily="monospace">field vel</text>
                </>
              )}
            </g>
          </svg>
        </div>

        {/* ── Controls ── */}
        <div className="flex-1 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            {(['Robot-centric', 'Field-centric'] as const).map(mode => (
              <button key={mode}
                onClick={() => setFieldCentric(mode === 'Field-centric')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  (mode === 'Field-centric') === fieldCentric
                    ? 'bg-sky-700 text-white'
                    : 'bg-sim-panel text-slate-400 hover:bg-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Heading slider (field-centric only) */}
          {fieldCentric && (
            <Slider label="Robot heading" value={heading} min={0} max={359} step={1}
              unit="°" format={v => `${v.toFixed(0)}°`} onChange={setHeading} />
          )}

          {/* Velocity sliders */}
          <Slider label="Vx (forward)" value={vx} min={-1} max={1} step={0.05}
            unit="m/s" onChange={setVx} />
          <Slider label="Vy (left)" value={vy} min={-1} max={1} step={0.05}
            unit="m/s" onChange={setVy} />
          <Slider label="ω (CCW)" value={omega} min={-3} max={3} step={0.1}
            unit="rad/s" onChange={setOmega} />

          {/* Presets */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button key={p.label}
                  onClick={() => { setVx(p.vx); setVy(p.vy); setOmega(p.omega); }}
                  className="py-1.5 px-2 rounded-lg bg-sim-panel border border-sim-border text-xs text-slate-300 hover:border-sky-500 hover:text-sky-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Per-module stats */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Module states</p>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-1">Module</th>
                  <th className="text-right py-1">Angle</th>
                  <th className="text-right py-1">Speed</th>
                  <th className="text-right py-1">Norm</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(m => (
                  <tr key={m.id} className="border-t border-sim-border">
                    <td className="py-1.5 font-bold text-sky-400">{m.id}</td>
                    <td className="text-right text-slate-300">
                      {(m.angle * 180 / Math.PI).toFixed(1)}°
                    </td>
                    <td className="text-right text-slate-300">{m.speed.toFixed(3)} m/s</td>
                    <td className={`text-right ${m.speed / maxSpeed > 0.9 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {(m.speed / maxSpeed * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-500 mt-2">
              Max module speed: <span className="text-sim-accent font-mono">{maxSpeed.toFixed(3)} m/s</span>
              {maxSpeed > 1.0 && <span className="text-amber-400 ml-2">→ normalised to 1.0</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation card */}
      <div className="rounded-lg bg-sim-panel border border-sim-border p-4 text-xs text-slate-400 leading-relaxed space-y-1">
        <p>
          <span className="text-slate-300 font-semibold">Inverse kinematics: </span>
          For each module at position (rx, ry) from the robot centre:
          <span className="text-sky-300 font-mono ml-1">Wx = Vx − ω·ry</span>,{' '}
          <span className="text-sky-300 font-mono">Wy = Vy + ω·rx</span>.
          Speed = √(Wx²+Wy²), angle = atan2(Wy, Wx).
        </p>
        {fieldCentric && (
          <p>
            <span className="text-amber-300 font-semibold">Field-centric: </span>
            The joystick velocity (dashed) is rotated by −heading before IK so "forward" always means field-forward regardless of where the robot is pointing.
          </p>
        )}
      </div>
    </div>
  );
}
