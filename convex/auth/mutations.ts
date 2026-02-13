import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Define return type
interface AuthResult {
  success: boolean;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: "admin" | "physician" | "patient";
  };
}

// Store user in database (called from action)
export const storeUser = mutation({
  args: {
    email: v.string(),
    hashedPassword: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("physician"),
      v.literal("patient"),
    ),
    phoneNumber: v.optional(v.string()),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const now = new Date().toISOString();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.hashedPassword,
      name: args.name,
      role: args.role,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      phoneNumber: args.phoneNumber,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
      dateOfBirth: args.dateOfBirth,
      bloodGroup: args.bloodGroup,
    });

    // Create session token
    const token = generateSimpleToken();
    const expiresAt = getSimpleSessionExpiry();

    await ctx.db.insert("sessions", {
      userId: userId as Id<"users">,
      token,
      expiresAt,
      createdAt: now,
    });

    return {
      success: true,
      token,
      user: {
        _id: userId,
        email: args.email,
        name: args.name,
        role: args.role,
      },
    };
  },
});

// Handle successful login
export const handleSuccessfulLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create new session
    const token = generateSimpleToken();
    const expiresAt = getSimpleSessionExpiry();

    // Delete old sessions
    const oldSessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of oldSessions) {
      await ctx.db.delete(session._id);
    }

    // Create new session
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

// Simple token generator for mutations
function generateSimpleToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function getSimpleSessionExpiry(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

// Sign out
export const signOut = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Validate session
export const validateSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    isValid: boolean;
    user?: {
      _id: string;
      email: string;
      name: string;
      role: "admin" | "physician" | "patient";
    };
  }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return { isValid: false };
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < now) {
      await ctx.db.delete(session._id);
      return { isValid: false };
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      await ctx.db.delete(session._id);
      return { isValid: false };
    }

    return {
      isValid: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});
