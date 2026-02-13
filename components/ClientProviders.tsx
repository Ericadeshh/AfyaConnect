// components/ClientProviders.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/context/AuthContext"; // Import your custom AuthProvider
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        {" "}
        {/* Use your custom AuthProvider instead of ConvexAuthProvider */}
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}
