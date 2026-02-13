import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

const TABLE = "ai_summaries" as const;

export const create = mutation({
  args: {
    inputType: v.string(),
    inputPreview: v.string(),
    summary: v.string(),
    confidence: v.number(),
    modelUsed: v.string(),
    processingTimeMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const record = {
      ...args,
      createdAt: new Date().toISOString(), // UTC ISO string
    };
    return await ctx.db.insert(TABLE, record);
  },
});

export const countToday = query({
  args: { today: v.number() },
  handler: async (ctx, { today }) => {
    const start = new Date(today);
    start.setUTCHours(0, 0, 0, 0); // Use UTC for consistency
    const end = new Date(today);
    end.setUTCHours(23, 59, 59, 999);

    const docs = await ctx.db
      .query(TABLE)
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), start.toISOString()),
          q.lte(q.field("createdAt"), end.toISOString()),
        ),
      )
      .collect();

    return docs.length;
  },
});

export const avgProcessingTimeToday = query({
  args: { today: v.number() },
  handler: async (ctx, { today }) => {
    const start = new Date(today);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setUTCHours(23, 59, 59, 999);

    const docs = await ctx.db
      .query(TABLE)
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), start.toISOString()),
          q.lte(q.field("createdAt"), end.toISOString()),
        ),
      )
      .collect();

    if (docs.length === 0) return null;

    const totalMs = docs.reduce(
      (sum, doc) => sum + (doc.processingTimeMs ?? 0),
      0,
    );
    return totalMs / docs.length / 1000; // seconds
  },
});

export const avgConfidenceToday = query({
  args: { today: v.number() },
  handler: async (ctx, { today }) => {
    const start = new Date(today);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setUTCHours(23, 59, 59, 999);

    const docs = await ctx.db
      .query(TABLE)
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), start.toISOString()),
          q.lte(q.field("createdAt"), end.toISOString()),
        ),
      )
      .collect();

    if (docs.length === 0) return null;

    const total = docs.reduce((sum, doc) => sum + (doc.confidence ?? 0), 0);
    return total / docs.length;
  },
});
