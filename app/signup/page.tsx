"use client";

import { SignUpForm } from "@/components/auth";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] -z-10" />

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <SignUpForm />
      </div>
    </div>
  );
}
