// src/lib/mpesa/constants.ts
export const MPESA_ENV = {
  SANDBOX: "sandbox",
  PRODUCTION: "production",
} as const;

export const MPESA_API_URLS = {
  [MPESA_ENV.SANDBOX]: {
    AUTH: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    STK_PUSH: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    QUERY: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    B2C: "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
    B2B: "https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
    REVERSAL: "https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request",
    CONFIRMATION:
      "https://sandbox.safaricom.co.ke/mpesa/confirmation/v1/request",
  },
  [MPESA_ENV.PRODUCTION]: {
    AUTH: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    STK_PUSH: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    QUERY: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
    B2C: "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
    B2B: "https://api.safaricom.co.ke/mpesa/b2b/v1/paymentrequest",
    REVERSAL: "https://api.safaricom.co.ke/mpesa/reversal/v1/request",
    CONFIRMATION: "https://api.safaricom.co.ke/mpesa/confirmation/v1/request",
  },
} as const;

export const TRANSACTION_TYPES = {
  CUSTOMER_PAYBILL_ONLINE: "CustomerPayBillOnline",
  CUSTOMER_BUY_GOODS_ONLINE: "CustomerBuyGoodsOnline",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export const PAYMENT_TYPES = {
  BOOKING: "booking",
  SUBSCRIPTION: "subscription",
  ONBOARDING: "onboarding",
  REFERRAL_FEE: "referral_fee",
  WALLET_TOPUP: "wallet_topup",
} as const;
