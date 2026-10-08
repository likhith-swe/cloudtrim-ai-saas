/** Drizzle schema — 9 tables backing CloudTrim AI. */

import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const leaks = pgTable("leaks", {
  id: text("id").primaryKey(),
  resourceName: text("resource_name").notNull(),
  provider: text("provider").notNull(),
  region: text("region").notNull(),
  service: text("service").notNull(),
  category: text("category").notNull(),
  monthlyWasteUsd: integer("monthly_waste_usd").notNull(),
  wasteScore: integer("waste_score").notNull(),
  detectionReason: text("detection_reason").notNull(),
  riskLevel: text("risk_level").notNull(),
  terraformScript: text("terraform_script").notNull(),
  cliScript: text("cli_script").notNull(),
  metricsJson: text("metrics_json").notNull(),
  firstSeenAt: timestamp("first_seen_at").notNull().defaultNow(),
});

export const remediationHistory = pgTable("remediation_history", {
  id: text("id").primaryKey(),
  leakId: text("leak_id").notNull(),
  email: text("email"),
  scriptType: text("script_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  email: text("email").primaryKey(),
  vip: boolean("vip").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const userWatchlists = pgTable("user_watchlists", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  label: text("label").notNull(),
  provider: text("provider").notNull(),
  service: text("service").notNull(),
  minMonthlyWasteUsd: integer("min_monthly_waste_usd").notNull(),
  channel: text("channel").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastTriggeredAt: timestamp("last_triggered_at"),
});

export const subscriptions = pgTable("subscriptions", {
  email: text("email").primaryKey(),
  provider: text("provider").notNull(),
  externalId: text("external_id"),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  email: text("email").primaryKey(),
  source: text("source").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const alertEvents = pgTable("alert_events", {
  id: text("id").primaryKey(),
  watchlistId: text("watchlist_id"),
  leakId: text("leak_id"),
  channel: text("channel").notNull(),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const systemState = pgTable("system_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
