import { v } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Generate unique referral number
export function generateReferralNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${timestamp}-${random}`;
}

// Validate physician access
export async function validatePhysicianAccess(
  ctx: QueryCtx | MutationCtx,
  physicianId: string,
  token: string,
): Promise<boolean> {
  // First validate the session
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session) {
    return false;
  }

  // Check if session belongs to the physician
  if (session.userId !== physicianId) {
    return false;
  }

  // Get the user and verify role
  const user = await ctx.db.get(session.userId);
  if (!user || user.role !== "physician" || !user.isActive) {
    return false;
  }

  return true;
}

// Get physician by ID
export async function getPhysicianById(
  ctx: QueryCtx | MutationCtx,
  physicianId: string,
) {
  return await ctx.db.get(physicianId as any);
}
