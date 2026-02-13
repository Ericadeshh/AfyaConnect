"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "../notifications/notification-bell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PendingPhysicianReferrals from "./pending-physician-referrals";
import AdminReferrals from "./AdminReferrals";
import CalendarView from "./calendar-view";
import FacilityManagement from "./FacilityManagement";
import PhysicianManagement from "./PhysicianManagement";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Building2,
  Stethoscope,
  LogOut,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Hospital,
  TrendingUp,
  Menu,
  X,
  UserCircle,
  ChevronDown,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

type AdminView =
  | "overview"
  | "referrals"
  | "calendar"
  | "facilities"
  | "physicians";

type ReferralsSubTab = "all" | "pending";

export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [referralsSubTab, setReferralsSubTab] =
    useState<ReferralsSubTab>("all");
  const [stats, setStats] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { token } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch dashboard stats
  const dashboardStats = useQuery(api.admin.queries.getDashboardStats, {
    adminToken: token || "",
  });

  useEffect(() => {
    if (dashboardStats) {
      setStats(dashboardStats);
    }
  }, [dashboardStats]);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "referrals",
      label: "Referrals",
      icon: FileText,
      count: stats?.referrals.pendingApproval,
    },
    { id: "calendar", label: "Calendar", icon: Calendar },
    {
      id: "facilities",
      label: "Facilities",
      icon: Building2,
      count: stats?.facilities.pending,
    },
    {
      id: "physicians",
      label: "Physicians",
      icon: Stethoscope,
      count: stats?.physicians.pendingVerification,
    },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Implement dark mode logic here
  };

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Activity className="w-5 h-5 sm:w-8 sm:h-8 opacity-80" />
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-full">
                    This Month
                  </span>
                </div>
                <p className="text-xl sm:text-3xl font-bold">
                  {stats?.referrals.thisMonth || 0}
                </p>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1">
                  New Referrals
                </p>
                <p className="text-[10px] sm:text-xs text-blue-200 mt-1 sm:mt-2">
                  Total: {stats?.referrals.total || 0}
                </p>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-8 sm:h-8 opacity-80" />
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-full">
                    {stats?.referrals.completionRate || 0}%
                  </span>
                </div>
                <p className="text-xl sm:text-3xl font-bold">
                  {stats?.referrals.completed || 0}
                </p>
                <p className="text-xs sm:text-sm text-green-100 mt-0.5 sm:mt-1">
                  Completed
                </p>
                <p className="text-[10px] sm:text-xs text-green-200 mt-1 sm:mt-2">
                  Approved: {stats?.referrals.approved || 0}
                </p>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Clock className="w-5 h-5 sm:w-8 sm:h-8 opacity-80" />
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-full">
                    Action
                  </span>
                </div>
                <p className="text-xl sm:text-3xl font-bold">
                  {stats?.referrals.pendingApproval || 0}
                </p>
                <p className="text-xs sm:text-sm text-yellow-100 mt-0.5 sm:mt-1">
                  Pending Approval
                </p>
                <p className="text-[10px] sm:text-xs text-yellow-200 mt-1 sm:mt-2">
                  From physicians
                </p>
              </Card>

              <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-8 sm:h-8 opacity-80" />
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xl sm:text-3xl font-bold">
                  {stats?.physicians.active || 0}
                </p>
                <p className="text-xs sm:text-sm text-purple-100 mt-0.5 sm:mt-1">
                  Active Physicians
                </p>
                <p className="text-[10px] sm:text-xs text-purple-200 mt-1 sm:mt-2">
                  Pending: {stats?.physicians.pendingVerification || 0}
                </p>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Hospital className="w-4 h-5 sm:w-5 sm:h-5 text-blue-500" />
                  Facilities Overview
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Total Facilities</span>
                    <span className="font-semibold">
                      {stats?.facilities.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Active</span>
                    <span className="text-green-600 font-semibold">
                      {stats?.facilities.active || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-yellow-600 font-semibold">
                      {stats?.facilities.pending || 0}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-5 sm:w-5 sm:h-5 text-green-500" />
                  Referral Trends
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-green-600">
                      {stats?.referrals.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-blue-600 font-semibold">
                      {stats?.referrals.approved || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">Cancelled/Rejected</span>
                    <span className="text-red-600 font-semibold">
                      {stats?.referrals.cancelled || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                    <div
                      className="bg-green-500 h-1.5 sm:h-2 rounded-full"
                      style={{
                        width: `${stats?.referrals.completionRate || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        );

      case "referrals":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Sub-tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-hide">
              <Button
                onClick={() => setReferralsSubTab("all")}
                variant={referralsSubTab === "all" ? "default" : "ghost"}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap ${
                  referralsSubTab === "all"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                All Referrals
              </Button>
              <Button
                onClick={() => setReferralsSubTab("pending")}
                variant={referralsSubTab === "pending" ? "default" : "ghost"}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap ${
                  referralsSubTab === "pending"
                    ? "bg-yellow-500 text-white"
                    : "text-gray-600 hover:text-yellow-600"
                }`}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Pending Approval
                {stats?.referrals.pendingApproval > 0 && (
                  <span className="ml-1 px-1.5 sm:px-2 py-0.5 bg-white text-yellow-600 rounded-full text-[10px] sm:text-xs font-medium">
                    {stats?.referrals.pendingApproval}
                  </span>
                )}
              </Button>
            </div>

            {/* Sub-tab content */}
            {referralsSubTab === "all" ? (
              <AdminReferrals />
            ) : (
              <PendingPhysicianReferrals />
            )}
          </motion.div>
        );

      case "calendar":
        return <CalendarView />;

      case "facilities":
        return <FacilityManagement adminUser={user} token={token || ""} />;

      case "physicians":
        return <PhysicianManagement adminUser={user} token={token || ""} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Mobile menu button & Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Welcome message */}
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-gray-600">
                  Welcome back,
                </span>
                <span className="text-sm sm:text-base font-semibold text-gray-900 truncate max-w-[100px] sm:max-w-[150px]">
                  {user?.fullName?.split(" ")[0] || "Admin"}
                </span>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Notification Bell */}
              <NotificationBell userId={user?.id} />

              {/* Dark mode toggle (optional) */}
              <button
                onClick={toggleDarkMode}
                className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-gray-600" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {user?.fullName?.charAt(0) || "A"}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          // Navigate to profile settings
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          // Navigate to help
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as AdminView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm relative ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  variant="ghost"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <nav className="px-3 py-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <Button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as AdminView);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      variant="ghost"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.count > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                          {item.count}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </main>
    </div>
  );
}
