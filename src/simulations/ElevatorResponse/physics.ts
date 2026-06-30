export interface ElevatorConfig {
  massKg: number;
  gearRatio: number;
  sprocketRadiusM: number;
  motorStallTorqueNm: number;
  motorFreeSpeedRPM: number;
  motorStallCurrentA: number;
  targetHeightM: number;
}

export interface ElevatorFrame {
  t: number;
  posM: number;
  velMs: number;
  accMs2: number;
  motorTorqueNm: number;
  currentA: number;
}

/** Linear carriage free speed (m/s) given motor specs and gearing. */
export function freeSpeedLinearMps(config: ElevatorConfig): number {
  return (config.motorFreeSpeedRPM / 60) * 2 * Math.PI * config.sprocketRadiusM / config.gearRatio;
}

/** Max output force at the carriage (N) at stall. */
export function maxOutputForceN(config: ElevatorConfig): number {
  return (config.motorStallTorqueNm * config.gearRatio) / config.sprocketRadiusM;
}

/**
 * Step-simulate an elevator from rest to targetHeightM.
 * Motor model: F_motor = F_max * (1 - vel / v_free)
 * Net: F_net = F_motor - m*g, a = F_net / m
 */
export function simulateElevator(config: ElevatorConfig): ElevatorFrame[] {
  const { massKg, motorStallTorqueNm, motorStallCurrentA, targetHeightM } = config;

  const vFree   = freeSpeedLinearMps(config);
  const fMax    = maxOutputForceN(config);
  const fGrav   = massKg * 9.81;

  // If motor can't overcome gravity even at stall, return a single sad frame
  if (fMax <= fGrav) {
    return [{ t: 0, posM: 0, velMs: 0, accMs2: 0, motorTorqueNm: motorStallTorqueNm, currentA: motorStallCurrentA }];
  }

  const DT      = 0.01;
  const MAX_T   = 6.0;
  const frames: ElevatorFrame[] = [];

  let posM  = 0;
  let velMs = 0;

  for (let step = 0; step * DT <= MAX_T; step++) {
    const t = +(step * DT).toFixed(3);

    if (posM >= targetHeightM) {
      // Hold at target: push a few settling frames then stop
      for (let k = 0; k <= 20; k++) {
        frames.push({ t: t + k * DT, posM: targetHeightM, velMs: 0, accMs2: 0, motorTorqueNm: 0, currentA: 0 });
      }
      break;
    }

    const vFrac   = vFree > 0 ? Math.min(velMs / vFree, 1) : 0;
    const fMotor  = fMax * (1 - vFrac);
    const tMotor  = motorStallTorqueNm * (1 - vFrac);
    const iMotor  = motorStallCurrentA * (1 - vFrac);

    const fNet  = fMotor - fGrav;
    const acc   = fNet / massKg;

    frames.push({ t, posM, velMs, accMs2: acc, motorTorqueNm: tMotor, currentA: iMotor });

    velMs = Math.max(0, velMs + acc * DT);
    posM  = Math.min(targetHeightM, posM + velMs * DT);
  }

  return frames;
}

/** Time (s) when the carriage first reaches targetHeightM. -1 if never. */
export function travelTime(frames: ElevatorFrame[]): number {
  const f = frames.find((fr) => fr.posM >= frames[frames.length - 1].posM * 0.999 && fr.velMs < 0.01);
  return f ? f.t : -1;
}

/** Peak carriage velocity (m/s). */
export function maxVelocity(frames: ElevatorFrame[]): number {
  return Math.max(...frames.map((f) => f.velMs));
}

/** Peak motor current draw (A). */
export function peakCurrent(frames: ElevatorFrame[]): number {
  return Math.max(...frames.map((f) => f.currentA));
}

/** Peak acceleration (m/s²). */
export function peakAcceleration(frames: ElevatorFrame[]): number {
  return Math.max(...frames.map((f) => f.accMs2));
}
