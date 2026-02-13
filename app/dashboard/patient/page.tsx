"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PatientDashboard from "@/components/patient/PatientDashboard";

export default function PatientDashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/login?role=patient");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "patient") {
    return null;
  }

  // Transform user data for patient dashboard
  const patientUser = {
    id: user._id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    dateOfBirth: user.dateOfBirth || "",
    bloodGroup: user.bloodGroup || "",
    phoneNumber: user.phoneNumber || "",
  };

  return <PatientDashboard user={patientUser} onLogout={signOut} />;
}
