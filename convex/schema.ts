import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ai_summaries: defineTable({
    inputType: v.string(),
    inputPreview: v.string(),
    summary: v.string(),
    confidence: v.number(),
    modelUsed: v.string(),
    createdAt: v.string(),
    processingTimeMs: v.optional(v.number()),
  }).index("by_createdAt", ["createdAt"]),
});
