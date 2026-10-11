/** Shared domain types for CloudTrim AI. */

export type Provider = "aws" | "gcp" | "azure";

export type RiskLevel =
  | "safe_to_terminate"
  | "needs_snapshot"
  | "production_review";

export type LeakCategory =
  | "compute"
  | "storage"
  | "networking"
  | "database"
  | "serverless-ai";

export type AlertChannel = "telegram" | "whatsapp" | "slack" | "email";

export const RISK_ORDER: Record<RiskLevel, number> = {
  safe_to_terminate: 0,
  needs_snapshot: 1,
  production_review: 2,
};

/** Raw telemetry inputs consumed by the WasteScore formula. */
export interface WasteMetrics {
  /** Hours the compute ran below 3% CPU. */
  idleCpuHours: number;
  /** GB of unattached / orphaned storage. */
  orphanGb: number;
  /** Dollars of idle egress / NAT spend per month. */
  egressCostMonthly: number;
  /** GB of RAM provisioned but never touched (0-connection DBs). */
  overprovisionedRamGb: number;
  /** Consecutive days with zero network I/O. */
  zeroIoDays: number;
  /** Environment tag carried by the resource. */
  environment: string;
}

export interface CloudLeak {
  id: string;
  resourceName: string;
  provider: Provider;
  region: string;
  service: string;
  category: LeakCategory;
  /** Integer minor units (cents). 34800 === $348.00/mo. */
  monthlyWasteUsd: number;
  /** Normalized WasteScore 0-100. */
  wasteScore: number;
  detectionReason: string;
  riskLevel: RiskLevel;
  remediationScriptTerraform: string;
  remediationScriptCli: string;
  metrics: WasteMetrics;
  firstSeenAt: string;
}

export type LeakSort = "waste" | "score" | "recent";

export interface LeakFilters {
  provider?: string;
  service?: string;
  category?: string;
  minScore?: number;
  /** Minimum monthly waste in minor units (cents). */
  minWasteMinor?: number;
  maxRisk?: RiskLevel;
  q?: string;
  sort?: LeakSort;
}

export interface SessionUser {
  email: string;
  vip: boolean;
  iat: number;
  exp: number;
}

export interface Watchlist {
  id: string;
  email: string;
  label: string;
  provider: Provider | "any";
  service: string;
  /** Threshold in minor units (cents). */
  minMonthlyWasteUsd: number;
  channel: AlertChannel;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
}

export interface AlertEvent {
  id: string;
  watchlistId: string | null;
  leakId: string | null;
  channel: AlertChannel | "all";
  status: "delivered" | "skipped" | "failed";
  latencyMs: number;
  message: string;
  createdAt: string;
}

export type BillingProvider = "razorpay" | "stripe" | "sandbox";

export interface Subscription {
  email: string;
  provider: BillingProvider;
  externalId: string | null;
  plan: string;
  status: "active" | "canceled" | "past_due";
  amountMinor: number;
  currency: "inr" | "usd";
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  source: string;
  createdAt: string;
}

export interface RemediationRecord {
  id: string;
  leakId: string;
  email: string | null;
  scriptType: "terraform" | "cli";
  createdAt: string;
}

export interface WasteBreakdownRow {
  key: string;
  label: string;
  detail: string;
  /** Weighted contribution to the final score. */
  weighted: number;
  /** Max weighted contribution possible for this component. */
  max: number;
}

export interface WasteBreakdown {
  rows: WasteBreakdownRow[];
  bonus: number;
  penalty: number;
  total: number;
}

export interface CatalogStats {
  leakCount: number;
  totalMonthlyWasteMinor: number;
  highImpactCount: number;
  avgScore: number;
  topLeakId: string | null;
  lastScanAt: string;
}

export interface ChannelResult {
  channel: AlertChannel;
  ok: boolean;
  skipped: boolean;
  latencyMs: number;
  detail: string;
}
