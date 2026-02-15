"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateReferralPage from "./create-referral";
import PendingReferralsPage from "./pending-referrals";
import CompletedReferralsPage from "./completed-referrals";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  FileText,
  Clock,
  CheckCircle,
  LogOut,
  Activity,
  ArrowRight,
} from "lucide-react";

interface PhysicianDashboardProps {
  user: any;
  onLogout: () => void;
}

type PhysicianPage = "dashboard" | "create" | "pending" | "completed";

// Define the expected return type
interface PhysicianStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  approvedReferrals: number;
  aiSummaryCount: number;
  recentActivity: Array<{
    type: string;
    title: string;
    patientName: string;
    time: string;
    status: string;
    statusColor: string;
    color: string;
  }>;
}

export default function PhysicianDashboard({
  user,
  onLogout,
}: PhysicianDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PhysicianPage>("dashboard");
  const { token } = useAuth();
  const router = useRouter();

  // @ts-ignore
  const physicianStats = useQuery(
    // @ts-ignore
    api.physicians.queries.getPhysicianDashboardStats,
    {
      token: token || "",
      physicianId: user?.id,
    },
  ) as PhysicianStats | undefined;

  // Fetch counts for badges
  const pendingCount = useQuery(
    api.referrals.queries.getPhysicianPendingCount,
    {
      token: token || "",
      physicianId: user?.id,
    },
  ) as number | undefined;

  const completedCount = useQuery(
    api.referrals.queries.getPhysicianCompletedCount,
    {
      token: token || "",
      physicianId: user?.id,
    },
  ) as number | undefined;

  if (currentPage === "create") {
    return (
      <CreateReferralPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={token || ""}
      />
    );
  }

  if (currentPage === "pending") {
    return (
      <PendingReferralsPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={token || ""}
      />
    );
  }

  if (currentPage === "completed") {
    return (
      <CompletedReferralsPage
        physician={user}
        onBack={() => setCurrentPage("dashboard")}
        token={token || ""}
      />
    );
  }

  const handleAIClick = () => {
    router.push("/dashboard/ai-dashboard");
  };

  // Stats with consistent color palette
  const stats = [
    {
      label: "Total Referrals",
      value: physicianStats?.totalReferrals?.toString() || "0",
      icon: FileText,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Pending",
      value: pendingCount?.toString() || "0",
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      label: "Completed",
      value: completedCount?.toString() || "0",
      icon: CheckCircle,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      label: "AI Summaries",
      value: physicianStats?.aiSummaryCount?.toString() || "0",
      icon: Sparkles,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];

  const quickActions = [
    {
      label: "New Referral",
      onClick: () => setCurrentPage("create"),
      icon: FileText,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      hoverColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      label: "AI Summary",
      onClick: handleAIClick,
      icon: Sparkles,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      hoverColor: "hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
    {
      label: "View Pending",
      onClick: () => setCurrentPage("pending"),
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      hoverColor: "hover:bg-amber-100",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">
                Physician Portal
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    Dr. {user?.fullName?.replace(/^Dr\.?\s*/i, "")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.hospital || "General Hospital"}
                  </p>
                </div>
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                  {user?.fullName?.charAt(0) || "D"}
                </div>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome back, Dr.{" "}
            {user?.fullName?.replace(/^Dr\.?\s*/i, "").split(" ")[0]}
          </h2>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your referrals today.
          </p>
        </div>

        {/* Stats Grid with Consistent Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`p-5 border-0 shadow-sm hover:shadow-md transition-all duration-300 ${stat.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${action.bgColor} ${action.textColor} ${action.hoverColor} ${action.borderColor} transition-all shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Action Cards */}
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Patient Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Create New Referral - Blue Theme */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => setCurrentPage("create")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <FileText className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-white">
                New Referral
              </h3>
              <p className="text-sm text-slate-500 mb-4 group-hover:text-blue-50">
                Create and send a new patient referral
              </p>
              <span className="text-sm font-medium text-blue-600 group-hover:text-white inline-flex items-center gap-1">
                Create now <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>

          {/* Pending Referrals - Amber Theme */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => setCurrentPage("pending")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <Clock className="w-6 h-6 text-amber-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-white">
                Pending
              </h3>
              <p className="text-sm text-slate-500 mb-4 group-hover:text-amber-50">
                {pendingCount || 0} referrals awaiting approval
              </p>
              <span className="text-sm font-medium text-amber-600 group-hover:text-white inline-flex items-center gap-1">
                View pending <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>

          {/* Completed Referrals - Emerald Theme */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => setCurrentPage("completed")}
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <CheckCircle className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-white">
                Completed
              </h3>
              <p className="text-sm text-slate-500 mb-4 group-hover:text-emerald-50">
                {completedCount || 0} successful referrals
              </p>
              <span className="text-sm font-medium text-emerald-600 group-hover:text-white inline-flex items-center gap-1">
                View history <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>

          {/* AI Summarization - Purple Theme */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={handleAIClick}
          >
            <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all">
                <Sparkles className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-white flex items-center gap-2">
                AI Summary
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full group-hover:bg-white/20 group-hover:text-white">
                  New
                </span>
              </h3>
              <p className="text-sm text-slate-500 mb-4 group-hover:text-purple-50">
                Summarize patient reports instantly with AI
              </p>
              <span className="text-sm font-medium text-purple-600 group-hover:text-white inline-flex items-center gap-1">
                Try AI tool <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Recent Activity
          </h3>
          <Card className="p-4 border-0 shadow-sm bg-white">
            {physicianStats?.recentActivity &&
            physicianStats.recentActivity.length > 0 ? (
              physicianStats.recentActivity.map(
                (activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 bg-${activity.color}-50 rounded-lg flex items-center justify-center`}
                      >
                        {activity.type === "referral" ? (
                          <FileText
                            className={`w-4 h-4 text-${activity.color}-600`}
                          />
                        ) : (
                          <Sparkles
                            className={`w-4 h-4 text-${activity.color}-600`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.patientName} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 bg-${activity.statusColor}-50 text-${activity.statusColor}-700 rounded-full`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ),
              )
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No recent activity to display</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
