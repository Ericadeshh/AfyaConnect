// src/components/ClientProviders.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

// IMPORTANT: Verify this URL is correct
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
console.log("Convex URL:", convexUrl); // Add this to debug

const convex = new ConvexReactClient(convexUrl);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
