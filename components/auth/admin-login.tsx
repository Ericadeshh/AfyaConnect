"use client";

import React from "react";
import { SignInForm } from "./SignInForm";

export function AdminLogin() {
  return <SignInForm defaultRole="admin" />;
}
