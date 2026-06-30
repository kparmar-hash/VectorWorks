// Unit conversion utilities

export const LBS_TO_KG   = 0.453592;
export const KG_TO_LBS   = 1 / LBS_TO_KG;
export const IN_TO_M     = 0.0254;
export const M_TO_IN     = 1 / IN_TO_M;
export const FT_TO_M     = 0.3048;
export const M_TO_FT     = 1 / FT_TO_M;
export const RPM_TO_RADS = (2 * Math.PI) / 60;
export const RADS_TO_RPM = 60 / (2 * Math.PI);
export const G            = 9.80665; // m/s²

export const lbsToKg  = (lbs: number)  => lbs  * LBS_TO_KG;
export const kgToLbs  = (kg: number)   => kg   * KG_TO_LBS;
export const inToM    = (inches: number) => inches * IN_TO_M;
export const mToIn    = (m: number)    => m    * M_TO_IN;
export const ftToM    = (ft: number)   => ft   * FT_TO_M;
export const mToFt    = (m: number)    => m    * M_TO_FT;
export const mpsToFps = (mps: number)  => mps  * M_TO_FT;
export const fpsToMps = (fps: number)  => fps  * FT_TO_M;
export const rpmToRads = (rpm: number) => rpm  * RPM_TO_RADS;
export const radsToRpm = (rads: number) => rads * RADS_TO_RPM;

export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
