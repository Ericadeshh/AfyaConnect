import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Get all active facilities (public - accessible by physicians)
export const getActiveFacilities = query({
  args: {},
  handler: async (ctx): Promise<Doc<"facilities">[]> => {
    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return facilities;
  },
});

// Get facility by ID (public)
export const getFacilityById = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args): Promise<Doc<"facilities"> | null> => {
    return await ctx.db.get(args.facilityId);
  },
});

// Get all physicians for a specific facility (public)
export const getPhysiciansByFacility = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const physicians = await ctx.db
      .query("physicianProfiles")
      .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich with user data
    return await Promise.all(
      physicians.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          user: {
            name: user?.name,
          },
        };
      }),
    );
  },
});
