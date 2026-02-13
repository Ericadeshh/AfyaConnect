"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PhysicianDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "physician")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "physician") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Physician Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-lg mb-4">Welcome, Dr. {user.name}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">My Patients</h3>
            <p className="text-sm text-gray-600">View and manage patients</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Appointments</h3>
            <p className="text-sm text-gray-600">
              Schedule and manage appointments
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Medical Records</h3>
            <p className="text-sm text-gray-600">Access patient records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
