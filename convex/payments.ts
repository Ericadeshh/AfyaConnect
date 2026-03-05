// convex/payments.ts
import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

export const insertPayment = internalMutation({
  args: {
    amount: v.number(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      amount: args.amount,
      phoneNumber: args.phoneNumber,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updatePaymentCheckoutId = internalMutation({
  args: {
    paymentId: v.id("payments"),
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      checkoutRequestId: args.checkoutRequestId,
    });
  },
});

// ============================================================================
// PUBLIC MUTATIONS
// ============================================================================

export const updatePaymentStatusFromCallback = mutation({
  args: {
    checkoutRequestId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    transactionId: v.optional(v.string()),
    amount: v.optional(v.number()),
    phoneNumber: v.optional(v.union(v.string(), v.number())),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(
      `📞 Callback received for CheckoutRequestID: ${args.checkoutRequestId}`,
    );

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_checkoutRequestId", (q) =>
        q.eq("checkoutRequestId", args.checkoutRequestId),
      )
      .first();

    if (!payment) {
      console.error(
        `❌ Payment not found for checkoutRequestId: ${args.checkoutRequestId}`,
      );
      return;
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.transactionId) {
      updates.transactionId = args.transactionId;
    }

    if (args.phoneNumber) {
      updates.phoneNumber = String(args.phoneNumber).replace(".0", "");
    }

    await ctx.db.patch(payment._id, updates);
    console.log(`✅ Payment ${payment._id} updated to ${args.status}`);

    return payment._id;
  },
});

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

export const getPayment = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

export const getPaymentsByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .take(10);
  },
});

// ============================================================================
// PUBLIC ACTION
// ============================================================================

const getTimestamp = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const getPassword = (
  shortcode: string,
  passkey: string,
  timestamp: string,
): string => {
  const str = shortcode + passkey + timestamp;
  return btoa(str);
};

const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  const data = await response.json();
  return data.access_token;
};

export const initiateSTKPush = action({
  args: {
    amount: v.number(),
    phoneNumber: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    checkoutRequestId?: string;
    paymentId?: Id<"payments">;
    error?: string;
  }> => {
    const { amount, phoneNumber } = args;

    try {
      console.log(`💰 Initiating payment: KES ${amount} to ${phoneNumber}`);

      // @ts-expect-error - Deep type instantiation bug, but this works at runtime
      const paymentId = await ctx.runMutation(internal.payments.insertPayment, {
        amount,
        phoneNumber,
      });

      const timestamp = getTimestamp();
      const password = getPassword(
        process.env.MPESA_SHORTCODE!,
        process.env.MPESA_PASSKEY!,
        timestamp,
      );

      const token = await getAccessToken();
      console.log("🔑 Access token obtained");

      const response = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phoneNumber,
            CallBackURL: process.env.MPESA_CALLBACK_URL!,
            AccountReference: "UzimaCare",
            TransactionDesc: "Payment",
          }),
        },
      );

      const result = await response.json();
      console.log("📨 M-Pesa response:", result);

      if (result.CheckoutRequestID) {
        await ctx.runMutation(internal.payments.updatePaymentCheckoutId, {
          paymentId,
          checkoutRequestId: result.CheckoutRequestID,
        });
      }

      return {
        success: true,
        checkoutRequestId: result.CheckoutRequestID,
        paymentId,
      };
    } catch (error) {
      console.error("❌ STK Push error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  },
});
