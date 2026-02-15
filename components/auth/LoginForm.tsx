"use client";

import { useSearchParams } from "next/navigation";
import { SignInForm } from "./SignInForm";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "physician" | "patient") ||
    "patient";

  return <SignInForm defaultRole={role} />;
}
