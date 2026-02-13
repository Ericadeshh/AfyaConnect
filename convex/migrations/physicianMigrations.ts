import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Run this once to create physician profiles for existing physician users
export const createMissingPhysicianProfiles = mutation({
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

    // Get a default facility (first active facility)
    const defaultFacility = await ctx.db
      .query("facilities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    if (!defaultFacility) {
      throw new Error(
        "No active facility found. Please create a facility first.",
      );
    }

    // Get all users with physician role
    const physicianUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "physician"))
      .collect();

    console.log(`Found ${physicianUsers.length} users with physician role`);

    const results = {
      created: [] as Array<{
        userName: string;
        userEmail: string;
        profileId: Id<"physicianProfiles">;
      }>,
      alreadyExisting: [] as Array<{
        userName: string;
        userEmail: string;
        profileId: Id<"physicianProfiles">;
      }>,
      failed: [] as Array<{
        userName: string;
        userEmail: string;
        error: string;
      }>,
    };

    for (const user of physicianUsers) {
      try {
        // Check if profile already exists
        const existingProfile = await ctx.db
          .query("physicianProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .first();

        if (!existingProfile) {
          // Create profile with all required fields
          const profileId = await ctx.db.insert("physicianProfiles", {
            userId: user._id,
            facilityId: defaultFacility._id,
            licenseNumber:
              user.licenseNumber ||
              `TEMP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            specialization: user.specialization || "General Practice",
            qualifications: [],
            yearsOfExperience: 0,
            isActive: true,
            joinedAt: new Date().toISOString(),
            verifiedAt: new Date().toISOString(),
            verifiedBy: admin._id,
            availability: [], // Required field
          });

          results.created.push({
            userName: user.name || "Unknown",
            userEmail: user.email,
            profileId,
          });
        } else {
          results.alreadyExisting.push({
            userName: user.name || "Unknown",
            userEmail: user.email,
            profileId: existingProfile._id,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        results.failed.push({
          userName: user.name || "Unknown",
          userEmail: user.email,
          error: errorMessage,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${physicianUsers.length} physician users`,
      summary: {
        total: physicianUsers.length,
        created: results.created.length,
        existing: results.alreadyExisting.length,
        failed: results.failed.length,
      },
      details: results,
    };
  },
});
