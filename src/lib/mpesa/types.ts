// src/lib/mpesa/types.ts
import { PAYMENT_STATUS, PAYMENT_TYPES, TRANSACTION_TYPES } from "./constants";

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortCode: string;
  businessShortCode: string;
  environment: "sandbox" | "production";
  callbackUrl: string;
  confirmationUrl?: string;
  validationUrl?: string;
}

export interface STKPushRequest {
  businessShortCode: string;
  password: string;
  timestamp: string;
  transactionType: typeof TRANSACTION_TYPES.CUSTOMER_PAYBILL_ONLINE;
  amount: number;
  partyA: string; // Customer phone number
  partyB: string; // Business short code
  phoneNumber: string; // Customer phone number
  callBackURL: string;
  accountReference: string; // e.g., Booking ID
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKCallbackMetadata {
  Amount: number;
  MpesaReceiptNumber: string;
  TransactionDate: number;
  PhoneNumber: string;
}

export interface STKCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
}

export interface PaymentRecord {
  _id?: string;
  transactionId?: string;
  reference: string;
  amount: number;
  phoneNumber: string;
  userId?: string;
  facilityId?: string;
  paymentType: string; // Change to string to accept any value
  status: keyof typeof PAYMENT_STATUS;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  checkoutRequestID?: string;
  merchantRequestID?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "annually";
  features: string[];
  maxReferrals: number;
  maxUsers: number;
}

export interface InitiatePaymentParams {
  amount: number;
  phoneNumber: string;
  paymentType: string; // Change to string to accept any value
  userId?: string;
  facilityId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: any;
}
