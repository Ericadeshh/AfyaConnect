import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Sync user roles and ensure consistency
export const syncUserRoles = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const results = {
      updated: [] as Array<{
        userId: string;
        email: string;
        updates: Record<string, any>;
      }>,
      errors: [] as Array<{ userId: string; email: string; error: string }>,
    };

    for (const user of users) {
      try {
        const updates: Record<string, any> = {};

        if (!user.createdAt) {
          updates.createdAt = new Date().toISOString();
        }
        if (!user.updatedAt) {
          updates.updatedAt = new Date().toISOString();
        }
        if (user.isActive === undefined) {
          updates.isActive = true;
        }

        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(user._id, updates);
          results.updated.push({
            userId: user._id,
            email: user.email,
            updates,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        results.errors.push({
          userId: user._id,
          email: user.email,
          error: errorMessage,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${users.length} users`,
      summary: {
        total: users.length,
        updated: results.updated.length,
        errors: results.errors.length,
      },
      details: results,
    };
  },
});
