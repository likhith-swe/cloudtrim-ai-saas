/**
 * Multi-channel tripwire alert dispatchers:
 * Telegram Bot, WhatsApp Cloud API, Slack webhook and Resend email.
 * Every dispatcher tracks delivery latency and fails soft.
 */

import { ENV } from "./env";
import type { AlertChannel, ChannelResult } from "./types";

async function timed(
  channel: AlertChannel,
  fn: () => Promise<string>,
): Promise<ChannelResult> {
  const start = Date.now();
  try {
    const detail = await fn();
    return {
      channel,
      ok: true,
      skipped: false,
      latencyMs: Date.now() - start,
      detail,
    };
  } catch (err) {
    return {
      channel,
      ok: false,
      skipped: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : "dispatch failed",
    };
  }
}

function skipped(channel: AlertChannel, detail: string): ChannelResult {
  return { channel, ok: false, skipped: true, latencyMs: 0, detail };
}

export function channelsConfigured(): AlertChannel[] {
  const out: AlertChannel[] = [];
  if (ENV.telegramToken && ENV.telegramChatId) out.push("telegram");
  if (ENV.slackWebhookUrl) out.push("slack");
  if (ENV.whatsappToken && ENV.whatsappPhoneId) out.push("whatsapp");
  if (ENV.resendApiKey) out.push("email");
  return out;
}

export function sendTelegram(text: string): Promise<ChannelResult> {
  if (!ENV.telegramToken || !ENV.telegramChatId) {
    return Promise.resolve(skipped("telegram", "TELEGRAM_BOT_TOKEN not set"));
  }
  return timed("telegram", async () => {
    const res = await fetch(
      `https://api.telegram.org/bot${ENV.telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ENV.telegramChatId, text }),
      },
    );
    if (!res.ok) throw new Error(`telegram ${res.status}`);
    return "telegram delivered";
  });
}

export function sendSlack(text: string): Promise<ChannelResult> {
  if (!ENV.slackWebhookUrl) {
    return Promise.resolve(skipped("slack", "SLACK_WEBHOOK_URL not set"));
  }
  return timed("slack", async () => {
    const res = await fetch(ENV.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`slack ${res.status}`);
    return "slack delivered";
  });
}

export function sendWhatsApp(text: string): Promise<ChannelResult> {
  if (!ENV.whatsappToken || !ENV.whatsappPhoneId || !ENV.whatsappTo) {
    return Promise.resolve(skipped("whatsapp", "WhatsApp Cloud API not set"));
  }
  return timed("whatsapp", async () => {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${ENV.whatsappPhoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ENV.whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: ENV.whatsappTo,
          type: "text",
          text: { body: text },
        }),
      },
    );
    if (!res.ok) throw new Error(`whatsapp ${res.status}`);
    return "whatsapp delivered";
  });
}

export function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<ChannelResult> {
  if (!ENV.resendApiKey) {
    return Promise.resolve(skipped("email", "RESEND_API_KEY not set"));
  }
  return timed("email", async () => {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
    return `email delivered to ${to}`;
  });
}

export interface BroadcastSummary {
  attempted: number;
  delivered: number;
  results: ChannelResult[];
}

/** Fire an alert across every configured channel. */
export async function broadcastAlert(
  message: string,
  emailTo?: string,
): Promise<BroadcastSummary> {
  const jobs: Promise<ChannelResult>[] = [];
  const configured = channelsConfigured();

  if (configured.includes("telegram")) jobs.push(sendTelegram(message));
  if (configured.includes("slack")) jobs.push(sendSlack(message));
  if (configured.includes("whatsapp")) jobs.push(sendWhatsApp(message));
  if (configured.includes("email") && emailTo) {
    jobs.push(sendEmail(emailTo, "☁️ CloudTrim tripwire fired", `<p>${message}</p>`));
  }

  const results = await Promise.all(jobs);
  return {
    attempted: results.length,
    delivered: results.filter((r) => r.ok).length,
    results,
  };
}
