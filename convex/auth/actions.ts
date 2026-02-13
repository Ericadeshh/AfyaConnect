"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
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
  _id: Id<"users">; // Change this to Id type
  email: string;
  password: string;
  name: string;
  role: "admin" | "physician" | "patient";
  hospital?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phoneNumber?: string;
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
    // Physician fields
    hospital: v.optional(v.string()),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    // Patient fields
    dateOfBirth: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    console.log("SignUp action started for:", args.email);

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
      // Physician fields
      hospital: args.hospital,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
      // Patient fields
      dateOfBirth: args.dateOfBirth,
      bloodGroup: args.bloodGroup,
    });

    console.log("SignUp action result:", result);
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
    console.log("SignIn action started for:", args.email);

    // Get user from database - type assertion to ensure proper Id type
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

    // Call mutation to handle successful login - user._id is already Id<"users">
    const result = await ctx.runMutation(
      api.auth.mutations.handleSuccessfulLogin,
      {
        userId: user._id, // This is now properly typed as Id<"users">
      },
    );

    console.log("SignIn action result:", result);
    return result as AuthResult;
  },
});
