// This file contains minimal type definitions to break the circular references
import { Doc, Id } from "../_generated/dataModel";

// Define only what we need for auth
export interface AuthUser {
  _id: Id<"users">;
  email: string;
  password: string;
  name: string;
  role: "admin" | "physician" | "patient";
  isActive: boolean;
  hospital?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phoneNumber?: string;
}

export interface AuthResult {
  success: boolean;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: "admin" | "physician" | "patient";
  };
}

// Simple mutation function type
export type StoreUserArgs = {
  email: string;
  hashedPassword: string;
  name: string;
  role: "admin" | "physician" | "patient";
  phoneNumber?: string;
  hospital?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
};

export type HandleLoginArgs = {
  userId: Id<"users">;
};

export type GetUserByEmailArgs = {
  email: string;
};

export type GetUserByEmailAndRoleArgs = {
  email: string;
  role: "admin" | "physician" | "patient";
};
