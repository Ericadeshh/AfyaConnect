"use client";

import { useSearchParams } from "next/navigation";
import { SignUpForm } from "./SignUpForm";

export default function SignUpFormWrapper() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "physician" | "patient") ||
    "patient";

  return <SignUpForm defaultRole={role} />;
}
