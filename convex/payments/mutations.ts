// convex/payments/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getMpesaClient } from "../../src/lib/mpesa-config";
import {
  generateReference,
  formatPhoneNumber,
} from "../../src/lib/mpesa/utils";

export const initiateSTKPush = mutation({
  args: {
    amount: v.number(),
    phoneNumber: v.string(),
    paymentType: v.union(
      v.literal("booking"),
      v.literal("subscription"),
      v.literal("onboarding"),
      v.literal("referral_fee"),
      v.literal("wallet_topup"),
    ),
    userId: v.optional(v.id("users")),
    facilityId: v.optional(v.id("facilities")),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Initiating STK Push with args:", args);

      // Format phone number (for M-Pesa API)
      const formattedPhone = formatPhoneNumber(args.phoneNumber);

      // Generate unique reference
      const reference = generateReference();

      // Create payment record - ONLY use fields that exist in schema
      const paymentId = await ctx.db.insert("payments", {
        reference,
        amount: args.amount,
        phoneNumber: args.phoneNumber, // Store original phone number
        // DO NOT include formattedPhone - it doesn't exist in schema
        paymentType: args.paymentType,
        status: "pending",
        userId: args.userId,
        facilityId: args.facilityId,
        relatedEntityId: args.relatedEntityId,
        relatedEntityType: args.relatedEntityType,
        metadata: args.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Get M-Pesa client
      const mpesaClient = getMpesaClient();

      // Convert paymentType to uppercase for the M-Pesa client
      // This matches the PAYMENT_TYPES in constants.ts
      const mpesaPaymentType = args.paymentType.toUpperCase() as
        | "BOOKING"
        | "SUBSCRIPTION"
        | "ONBOARDING"
        | "REFERRAL_FEE"
        | "WALLET_TOPUP";

      // Initiate STK Push - use formattedPhone for the API
      const result = await mpesaClient.stkPush({
        amount: args.amount,
        phoneNumber: formattedPhone, // Use formatted phone for M-Pesa
        paymentType: mpesaPaymentType,
        userId: args.userId,
        facilityId: args.facilityId,
        relatedEntityId: args.relatedEntityId || paymentId,
        relatedEntityType: args.relatedEntityType,
        metadata: { ...args.metadata, paymentId, reference },
      });

      console.log("STK Push result:", result);

      // Update payment with STK details
      await ctx.db.patch(paymentId, {
        checkoutRequestID: result.CheckoutRequestID,
        merchantRequestID: result.MerchantRequestID,
        responseCode: result.ResponseCode,
        responseDescription: result.ResponseDescription,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        paymentId,
        checkoutRequestID: result.CheckoutRequestID,
        merchantRequestID: result.MerchantRequestID,
        responseDescription: result.ResponseDescription,
      };
    } catch (error) {
      console.error("STK Push failed:", error);
      throw new Error(
        `Payment failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const checkPaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

export const handleSTKCallback = mutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    console.log("Received STK callback:", args.body);

    const { body } = args;

    // Find payment by checkout request ID
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("checkoutRequestID"), body.CheckoutRequestID))
      .first();

    if (!payment) {
      console.error(
        "Payment not found for CheckoutRequestID:",
        body.CheckoutRequestID,
      );
      return { ResultCode: 1, ResultDesc: "Payment not found" };
    }

    // Extract callback metadata
    const metadata = body.CallbackMetadata?.Item || [];
    let mpesaReceiptNumber = "";
    let transactionDate = "";

    metadata.forEach((item: any) => {
      if (item.Name === "MpesaReceiptNumber") {
        mpesaReceiptNumber = item.Value;
      }
      if (item.Name === "TransactionDate") {
        transactionDate = item.Value.toString();
      }
    });

    // Update payment status
    const isSuccess = body.ResultCode === 0;

    await ctx.db.patch(payment._id, {
      status: isSuccess ? "completed" : "failed",
      mpesaReceiptNumber,
      transactionDate,
      stkCallback: body,
      updatedAt: new Date().toISOString(),
    });

    return { ResultCode: 0, ResultDesc: "Success" };
  },
});

export const test = mutation({
  args: {},
  handler: async () => {
    return {
      message: "Payment functions are working!",
      timestamp: new Date().toISOString(),
    };
  },
});
