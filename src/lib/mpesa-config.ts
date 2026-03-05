// src/lib/mpesa-config.ts
import { MpesaClient } from "./mpesa/client";

let mpesaClientInstance: MpesaClient | null = null;

export function getMpesaClient(): MpesaClient {
  if (!mpesaClientInstance) {
    const requiredEnvVars = [
      "MPESA_CONSUMER_KEY",
      "MPESA_CONSUMER_SECRET",
      "MPESA_PASSKEY",
      "MPESA_SHORTCODE",
      "MPESA_BUSINESS_SHORTCODE",
      "MPESA_CALLBACK_URL",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      console.error(
        `Missing M-Pesa environment variables: ${missingVars.join(", ")}`,
      );
    }

    const environment =
      process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox";

    mpesaClientInstance = new MpesaClient({
      consumerKey: process.env.MPESA_CONSUMER_KEY || "",
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
      passkey: process.env.MPESA_PASSKEY || "",
      shortCode: process.env.MPESA_SHORTCODE || "174379",
      businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || "174379",
      environment,
      callbackUrl:
        process.env.MPESA_CALLBACK_URL ||
        "https://example.com/api/mpesa/stk-callback",
      confirmationUrl: process.env.MPESA_CONFIRMATION_URL,
      validationUrl: process.env.MPESA_VALIDATION_URL,
    });
  }

  return mpesaClientInstance;
}

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: "basic",
    name: "Basic",
    price: Number(process.env.SUBSCRIPTION_BASIC_MONTHLY) || 2000,
    billingCycle: "monthly" as const,
    features: [
      "Up to 50 referrals/month",
      "5 user accounts",
      "Basic reporting",
      "Email support",
    ],
    maxReferrals: 50,
    maxUsers: 5,
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    price: Number(process.env.SUBSCRIPTION_PREMIUM_MONTHLY) || 5000,
    billingCycle: "monthly" as const,
    features: [
      "Unlimited referrals",
      "20 user accounts",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    maxReferrals: -1,
    maxUsers: 20,
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: Number(process.env.SUBSCRIPTION_ENTERPRISE_MONTHLY) || 10000,
    billingCycle: "monthly" as const,
    features: [
      "Unlimited referrals",
      "Unlimited users",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    maxReferrals: -1,
    maxUsers: -1,
  },
} as const;

export const ONBOARDING_FEE = Number(process.env.ONBOARDING_FEE_AMOUNT) || 5000;
export const REFERRAL_FEE = Number(process.env.REFERRAL_FEE_AMOUNT) || 200;
