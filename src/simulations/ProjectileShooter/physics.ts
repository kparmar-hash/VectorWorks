const G = 9.81; // m/s²

/**
 * Projectile position at time t.
 * @param v0 - exit speed (m/s)
 * @param angleDeg - launch angle above horizontal (deg)
 * @param h0 - launch height above ground (m)
 */
export function projectilePos(v0: number, angleDeg: number, h0: number, t: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: v0 * Math.cos(rad) * t,
    y: h0 + v0 * Math.sin(rad) * t - 0.5 * G * t * t,
  };
}

/**
 * Returns an array of (x, y) points tracing the full arc until y < 0 or y < floor.
 */
export function arcPoints(v0: number, angleDeg: number, h0: number, numSteps = 100): Array<{ x: number; y: number }> {
  const rad = (angleDeg * Math.PI) / 180;
  const vy0 = v0 * Math.sin(rad);
  const disc = vy0 * vy0 + 2 * G * h0;
  const tMax = disc >= 0 ? (vy0 + Math.sqrt(disc)) / G : (2 * vy0) / G;

  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * Math.max(tMax, 0.01);
    const p = projectilePos(v0, angleDeg, h0, t);
    pts.push(p);
    if (p.y < 0) break;
  }
  return pts;
}

/**
 * Finds the time when the projectile is at targetHeight (descending pass).
 * Returns null if it never reaches that height.
 */
export function timeAtHeight(v0: number, angleDeg: number, h0: number, targetHeight: number): number | null {
  const rad = (angleDeg * Math.PI) / 180;
  const vy0 = v0 * Math.sin(rad);
  // h0 + vy0*t - 0.5*G*t² = targetHeight
  const a = 0.5 * G;
  const b = -vy0;
  const c = targetHeight - h0;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t1 = (-b - Math.sqrt(disc)) / (2 * a);
  const t2 = (-b + Math.sqrt(disc)) / (2 * a);
  const valid = [t1, t2].filter((t) => t > 0.001);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

/**
 * Checks whether the shot hits the target opening.
 * @param targetDist - horizontal distance to target center (m)
 * @param targetHeight - height of the target opening center (m)
 * @param targetWidth - width of the target opening (m)
 */
export function checkShot(
  v0: number, angleDeg: number, h0: number,
  targetDist: number, targetHeight: number, targetWidth = 0.55,
): { hit: boolean; xAtHeight: number; missM: number } {
  const t = timeAtHeight(v0, angleDeg, h0, targetHeight);
  if (t === null) return { hit: false, xAtHeight: 0, missM: Infinity };
  const pos = projectilePos(v0, angleDeg, h0, t);
  const missM = pos.x - targetDist;
  const hit = Math.abs(missM) <= targetWidth / 2;
  return { hit, xAtHeight: pos.x, missM };
}

/**
 * Converts exit velocity to required wheel RPM.
 * @param vExitMps - desired ball exit speed (m/s)
 * @param wheelDiamM - shooter wheel diameter (m)
 * @param gearRatio - motor-to-wheel gear ratio
 */
export function exitVelocityToMotorRPM(vExitMps: number, wheelDiamM: number, gearRatio: number): number {
  const wheelRPS = vExitMps / (Math.PI * wheelDiamM);
  return wheelRPS * 60 * gearRatio;
}
