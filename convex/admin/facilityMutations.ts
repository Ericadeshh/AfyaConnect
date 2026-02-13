import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

interface FacilityResult {
  success: boolean;
  facilityId?: Id<"facilities">;
  error?: string;
}

// Create new facility
export const createFacility = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),

    name: v.string(),
    type: v.union(
      v.literal("hospital"),
      v.literal("clinic"),
      v.literal("health_center"),
      v.literal("specialized_clinic"),
    ),
    registrationNumber: v.string(),
    address: v.string(),
    city: v.string(),
    county: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    services: v.array(v.string()),
    departments: v.array(v.string()),
    bedCapacity: v.optional(v.number()),
    emergencyServices: v.boolean(),
    operatingHours: v.string(),
    accreditation: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<FacilityResult> => {
    // Verify admin
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

    const now = new Date().toISOString();

    const facilityId = await ctx.db.insert("facilities", {
      name: args.name,
      type: args.type,
      registrationNumber: args.registrationNumber,
      address: args.address,
      city: args.city,
      county: args.county,
      phone: args.phone,
      email: args.email,
      website: args.website,
      services: args.services,
      departments: args.departments,
      bedCapacity: args.bedCapacity,
      emergencyServices: args.emergencyServices,
      operatingHours: args.operatingHours,
      accreditation: args.accreditation,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: args.adminId,
    });

    // Log the action
    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: "CREATE_FACILITY",
      targetType: "facility",
      targetId: facilityId,
      details: { facilityName: args.name },
      timestamp: now,
    });

    return { success: true, facilityId };
  },
});

// Update facility
export const updateFacility = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),
    facilityId: v.id("facilities"),

    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("hospital"),
        v.literal("clinic"),
        v.literal("health_center"),
        v.literal("specialized_clinic"),
      ),
    ),
    registrationNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    departments: v.optional(v.array(v.string())),
    bedCapacity: v.optional(v.number()),
    emergencyServices: v.optional(v.boolean()),
    operatingHours: v.optional(v.string()),
    accreditation: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    ),
  },
  handler: async (ctx, args): Promise<FacilityResult> => {
    // Verify admin
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

    const { adminToken, adminId, facilityId, ...updates } = args;

    await ctx.db.patch(facilityId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // Log the action
    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: "UPDATE_FACILITY",
      targetType: "facility",
      targetId: facilityId,
      details: updates,
      timestamp: new Date().toISOString(),
    });

    return { success: true, facilityId };
  },
});

// Toggle facility status
export const toggleFacilityStatus = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),
    facilityId: v.id("facilities"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending"),
    ),
  },
  handler: async (ctx, args): Promise<FacilityResult> => {
    // Verify admin
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

    await ctx.db.patch(args.facilityId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: "UPDATE_FACILITY_STATUS",
      targetType: "facility",
      targetId: args.facilityId,
      details: { status: args.status },
      timestamp: new Date().toISOString(),
    });

    return { success: true, facilityId: args.facilityId };
  },
});
