"use client";

import { SignInForm } from "@/components/auth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "physician" | "patient") ||
    "patient";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {role === "admin" && "Admin Access"}
            {role === "physician" && "Physician Portal"}
            {role === "patient" && "Patient Portal"}
          </p>
        </div>
        <SignInForm defaultRole={role} />
      </div>
    </div>
  );
}
