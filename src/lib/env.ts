/** Safe environment readers with resilient fallback defaults. */

export function strEnv(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : fallback;
}

export function boolEnv(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined || v === null || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

export const ENV = {
  get siteUrl(): string {
    return strEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  },
  get databaseUrl(): string {
    return strEnv("DATABASE_URL");
  },
  get sessionSecret(): string {
    return strEnv("SESSION_SECRET", "cloudtrim-dev-insecure-secret-v1");
  },
  /** Default Razorpay hosted payment link — required fallback. */
  get razorpayLink(): string {
    return strEnv("RAZORPAY_ME_LINK", "https://razorpay.me/@NEXVRA");
  },
  get razorpayWebhookSecret(): string {
    return strEnv("RAZORPAY_WEBHOOK_SECRET");
  },
  get stripeSecretKey(): string {
    return strEnv("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret(): string {
    return strEnv("STRIPE_WEBHOOK_SECRET");
  },
  get stripePriceId(): string {
    return strEnv("STRIPE_PRICE_ID");
  },
  get resendApiKey(): string {
    return strEnv("RESEND_API_KEY");
  },
  get emailFrom(): string {
    return strEnv("RESEND_FROM", "CloudTrim AI <radar@cloudtrim.example>");
  },
  get telegramToken(): string {
    return strEnv("TELEGRAM_BOT_TOKEN");
  },
  get telegramChatId(): string {
    return strEnv("TELEGRAM_CHAT_ID");
  },
  get slackWebhookUrl(): string {
    return strEnv("SLACK_WEBHOOK_URL");
  },
  get whatsappToken(): string {
    return strEnv("WHATSAPP_TOKEN");
  },
  get whatsappPhoneId(): string {
    return strEnv("WHATSAPP_PHONE_ID");
  },
  get whatsappTo(): string {
    return strEnv("WHATSAPP_TO");
  },
  get cronSecret(): string {
    return strEnv("CRON_SECRET");
  },
};
