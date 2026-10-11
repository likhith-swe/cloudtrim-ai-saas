/**
 * CloudTrim AI — WasteScore engine.
 *
 * WasteScore = 0.40 * S_idle_compute
 *            + 0.25 * S_orphan_storage
 *            + 0.20 * S_egress_drain
 *            + 0.15 * S_db_waste
 *            + B_critical_abandoned
 *            - P_production_risk
 */

import type { WasteBreakdown, WasteMetrics } from "./types";

export const WEIGHTS = {
  idleCompute: 0.4,
  orphanStorage: 0.25,
  egressDrain: 0.2,
  dbWaste: 0.15,
} as const;

export const BONUS_CRITICAL_ABANDONED = 15;
export const PENALTY_PRODUCTION_RISK = 30;

export const HIGH_IMPACT_MIN_SCORE = 80;
/** $150/mo expressed in minor units. */
export const HIGH_IMPACT_MIN_WASTE_MINOR = 15_000;

export const ABANDONED_ZERO_IO_DAYS = 14;

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/** Instances running < 3% CPU, normalized over a 72h window. */
export function sIdleCompute(idleCpuHours: number): number {
  return clamp((idleCpuHours / 72) * 100, 0, 100);
}

/** Orphan storage normalized over 500 GB. */
export function sOrphanStorage(orphanGb: number): number {
  return clamp((orphanGb / 500) * 100, 0, 100);
}

/** Idle NAT / egress drain normalized over $300/mo. */
export function sEgressDrain(egressCostMonthly: number): number {
  return clamp((egressCostMonthly / 300) * 100, 0, 100);
}

/** Overprovisioned DB RAM normalized over 64 GB. */
export function sDbWaste(overprovisionedRamGb: number): number {
  return clamp((overprovisionedRamGb / 64) * 100, 0, 100);
}

function isProductionEnv(environment: string): boolean {
  const e = environment.toLowerCase();
  return e === "prod" || e === "production";
}

/** Full formula → integer score 0-100. */
export function computeWasteScore(m: WasteMetrics): number {
  const base =
    WEIGHTS.idleCompute * sIdleCompute(m.idleCpuHours) +
    WEIGHTS.orphanStorage * sOrphanStorage(m.orphanGb) +
    WEIGHTS.egressDrain * sEgressDrain(m.egressCostMonthly) +
    WEIGHTS.dbWaste * sDbWaste(m.overprovisionedRamGb);

  const bonus =
    m.zeroIoDays >= ABANDONED_ZERO_IO_DAYS ? BONUS_CRITICAL_ABANDONED : 0;
  const penalty = isProductionEnv(m.environment)
    ? PENALTY_PRODUCTION_RISK
    : 0;

  return Math.round(clamp(base + bonus - penalty, 0, 100));
}

/** High-impact classification: score >= 80 AND >= $150/mo waste. */
export function isHighImpactLeak(
  wasteScore: number,
  monthlyWasteMinor: number,
): boolean {
  return (
    wasteScore >= HIGH_IMPACT_MIN_SCORE &&
    monthlyWasteMinor >= HIGH_IMPACT_MIN_WASTE_MINOR
  );
}

/** Human-auditable breakdown used on leak audit pages + API. */
export function explainBreakdown(m: WasteMetrics): WasteBreakdown {
  const rows = [
    {
      key: "idle_compute",
      label: "Idle compute",
      detail: `${Math.round(m.idleCpuHours)}h < 3% CPU (÷72h)`,
      weighted: round1(WEIGHTS.idleCompute * sIdleCompute(m.idleCpuHours)),
      max: WEIGHTS.idleCompute * 100,
    },
    {
      key: "orphan_storage",
      label: "Orphan storage",
      detail: `${Math.round(m.orphanGb)} GB unattached (÷500 GB)`,
      weighted: round1(
        WEIGHTS.orphanStorage * sOrphanStorage(m.orphanGb),
      ),
      max: WEIGHTS.orphanStorage * 100,
    },
    {
      key: "egress_drain",
      label: "Egress drain",
      detail: `$${Math.round(m.egressCostMonthly)}/mo idle NAT + x-AZ (÷$300)`,
      weighted: round1(WEIGHTS.egressDrain * sEgressDrain(m.egressCostMonthly)),
      max: WEIGHTS.egressDrain * 100,
    },
    {
      key: "db_waste",
      label: "Database waste",
      detail: `${Math.round(m.overprovisionedRamGb)} GB idle RAM (÷64 GB)`,
      weighted: round1(WEIGHTS.dbWaste * sDbWaste(m.overprovisionedRamGb)),
      max: WEIGHTS.dbWaste * 100,
    },
  ];

  const bonus =
    m.zeroIoDays >= ABANDONED_ZERO_IO_DAYS ? BONUS_CRITICAL_ABANDONED : 0;
  const penalty = isProductionEnv(m.environment)
    ? PENALTY_PRODUCTION_RISK
    : 0;
  const base = rows.reduce((acc, r) => acc + r.weighted, 0);
  const total = Math.round(clamp(base + bonus - penalty, 0, 100));

  return { rows, bonus, penalty, total };
}

export const FORMULA_TEXT =
  "WasteScore = 0.40·S_idle + 0.25·S_orphan + 0.20·S_egress + 0.15·S_db + B_abandoned(≤14d zero I/O) − P_prod";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
