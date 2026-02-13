"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PatientDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "patient") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-lg mb-4">Welcome, {user.name}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">My Appointments</h3>
            <p className="text-sm text-gray-600">
              View and schedule appointments
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Medical History</h3>
            <p className="text-sm text-gray-600">Access your medical records</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Prescriptions</h3>
            <p className="text-sm text-gray-600">View your prescriptions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
