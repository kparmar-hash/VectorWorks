export interface PidConfig {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;     // degrees
  systemInertia: number; // 0.1–2.0 (lower = faster mechanism)
  dtS: number;          // timestep (s)
  simDurationS: number; // total duration (s)
}

export interface PidFrame {
  t: number;
  position: number;  // degrees
  velocity: number;  // deg/s
  error: number;
  pTerm: number;
  iTerm: number;
  dTerm: number;
  output: number;    // clamped [-1, 1]
}

const MAX_ANG_ACCEL = 600; // deg/s² at output = 1, systemInertia = 1
const DAMPING = 0.08;      // velocity damping per step

/**
 * Simulate a PID controller driving a rotational system.
 * Mechanism starts at 0°, setpoint is the target angle.
 * Output is clamped to [-1, 1], integral clamped to [-0.5, 0.5].
 */
export function simulatePid(config: PidConfig): PidFrame[] {
  const { kp, ki, kd, setpoint, systemInertia, dtS, simDurationS } = config;

  const steps = Math.ceil(simDurationS / dtS);
  const frames: PidFrame[] = [];

  let position = 0;
  let velocity = 0;
  let integral = 0;
  let prevError = setpoint; // error at t=0 is (setpoint - 0)

  for (let i = 0; i <= steps; i++) {
    const t = +(i * dtS).toFixed(4);
    const error = setpoint - position;

    integral = Math.max(-0.5, Math.min(0.5, integral + error * dtS));

    const pTerm = kp * error;
    const iTerm = ki * integral;
    const dTerm = kd * (error - prevError) / dtS;

    const rawOutput = pTerm + iTerm + dTerm;
    const output = Math.max(-1, Math.min(1, rawOutput));

    frames.push({ t, position, velocity, error, pTerm, iTerm, dTerm, output });

    // Physics update: 2nd-order system
    const accel = (output * MAX_ANG_ACCEL) / systemInertia - DAMPING * velocity;
    velocity += accel * dtS;
    position += velocity * dtS;

    prevError = error;
  }

  return frames;
}

/**
 * Time (s) when the system first settles within ±tolerance of setpoint
 * and stays there for the rest of the simulation. Returns Infinity if never settled.
 */
export function settlingTime(frames: PidFrame[], tolerance: number): number {
  // Find last frame that is outside tolerance, settling time = that frame's time + dtS
  for (let i = frames.length - 1; i >= 0; i--) {
    if (Math.abs(frames[i].error) > tolerance) {
      return i + 1 < frames.length ? frames[i + 1].t : Infinity;
    }
  }
  return frames[0]?.t ?? 0;
}

/**
 * Max overshoot beyond the setpoint (degrees). Positive = overshot, 0 = no overshoot.
 */
export function overshoot(frames: PidFrame[]): number {
  if (!frames.length) return 0;
  const sp = frames[0].error + frames[0].position; // = setpoint (since pos=0 at t=0)
  const maxPos = Math.max(...frames.map((f) => f.position));
  return Math.max(0, maxPos - sp);
}

/**
 * True if the system has settled within ±tolerance by end of simulation.
 */
export function isStable(frames: PidFrame[], tolerance: number): boolean {
  const last20 = frames.slice(-20);
  return last20.every((f) => Math.abs(f.error) < tolerance);
}

/**
 * Classify behavior: 'Stable' | 'Underdamped' | 'Oscillating' | 'Diverging'
 */
export function detectBehavior(frames: PidFrame[], setpoint: number, tolerance: number): string {
  if (!frames.length) return 'Stable';
  const last = frames[frames.length - 1];

  // Diverging: position far from setpoint and growing
  const mid = frames[Math.floor(frames.length / 2)];
  const midErr = Math.abs(mid.error);
  const lastErr = Math.abs(last.error);
  if (lastErr > 200 || (lastErr > midErr * 2 && lastErr > 30)) return 'Diverging';

  // Stable: settled within tolerance
  const lastQtr = frames.slice(Math.floor(frames.length * 0.75));
  if (lastQtr.every((f) => Math.abs(f.error) <= tolerance)) return 'Stable';

  // Count zero-crossings in last quarter of error
  let crossings = 0;
  for (let i = 1; i < lastQtr.length; i++) {
    if (Math.sign(lastQtr[i].error) !== Math.sign(lastQtr[i - 1].error)) crossings++;
  }

  if (crossings >= 4) return 'Oscillating';
  return 'Underdamped';
}
