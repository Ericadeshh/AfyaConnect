import { Suspense } from "react";
import SignUpFormWrapper from "@/components/auth/SignUpFormWrapper";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] -z-10" />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Suspense
          fallback={
            <div className="w-full max-w-md text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          }
        >
          <SignUpFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
