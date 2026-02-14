import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// Get user by email only (without role) - for better error messages
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by email and role (for signin)
export const getUserByEmailAndRole = query({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("physician"),
      v.literal("patient"),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_email_and_role", (q) =>
        q.eq("email", args.email).eq("role", args.role),
      )
      .first();
  },
});

// Get current user by token
export const getCurrentUser = query({
  args: {
    token: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Omit<Doc<"users">, "password"> | null> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < now) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Get user by ID (admin only)
export const getUserById = query({
  args: {
    userId: v.id("users"),
    adminToken: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Omit<Doc<"users">, "password"> | null> => {
    const adminSession = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!adminSession) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db.get(adminSession.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// List all users (admin only)
export const listUsers = query({
  args: {
    adminToken: v.string(),
    role: v.optional(
      v.union(v.literal("admin"), v.literal("physician"), v.literal("patient")),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<Array<Omit<Doc<"users">, "password">>> => {
    const adminSession = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!adminSession) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db.get(adminSession.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    let users: Doc<"users">[];
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    return users.map(({ password, ...user }) => user);
  },
});
