// convex/payments/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserPayments = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // First, check if the payments table exists and has data
      const allPayments = await ctx.db.query("payments").collect();

      // Filter by userId
      const userPayments = allPayments.filter((p) => p.userId === args.userId);

      // Filter by status if provided
      let result = userPayments;
      if (args.status) {
        result = result.filter((p) => p.status === args.status);
      }

      // Sort by creation time (newest first)
      result.sort((a, b) => b._creationTime - a._creationTime);

      // Apply limit
      if (args.limit) {
        result = result.slice(0, args.limit);
      }

      return result;
    } catch (error) {
      console.error("Error in getUserPayments:", error);
      // Return empty array instead of crashing
      return [];
    }
  },
});

export const getUserWallet = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const wallets = await ctx.db.query("patientWallets").collect();
      return wallets.find((w) => w.userId === args.userId) || null;
    } catch (error) {
      // If table doesn't exist, return null gracefully
      console.error("Wallet table may not exist yet:", error);
      return null;
    }
  },
});

// Optional: Add this if you need it
export const getPaymentByReference = query({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const payments = await ctx.db.query("payments").collect();
      return payments.find((p) => p.reference === args.reference) || null;
    } catch (error) {
      console.error("Error in getPaymentByReference:", error);
      return null;
    }
  },
});
