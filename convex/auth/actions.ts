"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import crypto from "crypto";

// Type definitions for return values
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

interface UserWithPassword {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "physician" | "patient";
  [key: string]: any; // For other fields
}

// Password hashing function using Node.js crypto
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

// Password verification function
export function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): boolean {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return storedHash === hash;
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Action wrapper for signup that uses crypto
export const signUpWithCrypto = action({
  args: {
    email: v.string(),
    password: v.string(),
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
    // Hash password using Node.js crypto
    const { salt, hash } = hashPassword(args.password);
    const hashedPassword = `${salt}:${hash}`;

    // Call the mutation to store user in database
    const result = await ctx.runMutation(api.auth.mutations.storeUser, {
      email: args.email,
      hashedPassword,
      name: args.name,
      role: args.role,
      phoneNumber: args.phoneNumber,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
      dateOfBirth: args.dateOfBirth,
      bloodGroup: args.bloodGroup,
    });

    return result as AuthResult;
  },
});

// Action wrapper for signin that uses crypto
export const signInWithCrypto = action({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("physician"),
      v.literal("patient"),
    ),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    // Get user from database
    const user = (await ctx.runQuery(api.auth.queries.getUserByEmailAndRole, {
      email: args.email,
      role: args.role,
    })) as UserWithPassword | null;

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password using Node.js crypto
    const [salt, storedHash] = user.password.split(":");
    const isValid = verifyPassword(args.password, salt, storedHash);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Call mutation to handle successful login
    const result = await ctx.runMutation(
      api.auth.mutations.handleSuccessfulLogin,
      {
        userId: user._id as any, // Convert to Id<"users"> type
      },
    );

    return result as AuthResult;
  },
});
