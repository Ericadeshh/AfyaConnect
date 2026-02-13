"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login?role=admin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Transform user data to match the expected format in AdminDashboard
  const adminUser = {
    id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
  };

  return <AdminDashboard user={adminUser} onLogout={signOut} />;
}
