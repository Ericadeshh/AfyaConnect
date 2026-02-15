"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import crypto from "crypto";
import type {
  AuthResult,
  AuthUser,
  StoreUserArgs,
  HandleLoginArgs,
  GetUserByEmailArgs,
  GetUserByEmailAndRoleArgs,
} from "./authTypes";

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
    hospital: v.optional(v.string()),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    console.log("SignUp action started for:", args.email);

    // Hash password using Node.js crypto
    const { salt, hash } = hashPassword(args.password);
    const hashedPassword = `${salt}:${hash}`;

    // Create a minimal args object
    const storeUserArgs: StoreUserArgs = {
      email: args.email,
      hashedPassword,
      name: args.name,
      role: args.role,
      phoneNumber: args.phoneNumber,
      hospital: args.hospital,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
      dateOfBirth: args.dateOfBirth,
      bloodGroup: args.bloodGroup,
    };

    // Use type assertion to bypass the complex types
    const result = await ctx.runMutation(
      api.auth.mutations.storeUser as any,
      storeUserArgs,
    );

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

    // Get user from database with the specified role
    const getUserArgs: GetUserByEmailAndRoleArgs = {
      email: args.email,
      role: args.role,
    };

    const user = (await ctx.runQuery(
      api.auth.queries.getUserByEmailAndRole as any,
      getUserArgs,
    )) as AuthUser | null;

    if (!user) {
      // Check if user exists with a different role
      const getUserByEmailArgs: GetUserByEmailArgs = {
        email: args.email,
      };

      const userByEmail = (await ctx.runQuery(
        api.auth.queries.getUserByEmail as any,
        getUserByEmailArgs,
      )) as AuthUser | null;

      if (userByEmail) {
        throw new Error(
          `This account is registered as a ${userByEmail.role}. Please sign in with the correct role.`,
        );
      } else {
        throw new Error(
          "No account found with this email address. Please sign up first.",
        );
      }
    }

    // Verify password
    const [salt, storedHash] = user.password.split(":");
    const isValid = verifyPassword(args.password, salt, storedHash);

    if (!isValid) {
      throw new Error(
        "The password you entered is incorrect. Please try again.",
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error(
        "This account has been deactivated. Please contact support.",
      );
    }

    // Call mutation to handle successful login
    const handleLoginArgs: HandleLoginArgs = {
      userId: user._id,
    };

    const result = await ctx.runMutation(
      api.auth.mutations.handleSuccessfulLogin as any,
      handleLoginArgs,
    );

    console.log("SignIn action result:", result);
    return result as AuthResult;
  },
});
