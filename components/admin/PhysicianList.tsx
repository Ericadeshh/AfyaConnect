"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Search,
  UserCheck,
  UserX,
  Building2,
  Mail,
  Phone,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Calendar,
  MapPin,
  Star,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Users,
  BadgeCheck,
  GraduationCap,
  Briefcase,
  HeartPulse,
  Activity,
  ArrowLeft,
  List,
} from "lucide-react";
import { format } from "date-fns";

interface PhysicianListProps {
  adminUser: any;
  token: string;
}

interface Physician {
  _id: Id<"physicianProfiles">;
  userId: Id<"users">;
  facilityId: Id<"facilities">;
  licenseNumber: string;
  specialization: string;
  qualifications: string[];
  yearsOfExperience: number;
  consultationFee?: number;
  isActive: boolean;
  joinedAt: string;
  verifiedAt?: string;
  verifiedBy?: Id<"users">;
  user?: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
  facilityName?: string;
  facilityCity?: string;
}

export default function PhysicianList({
  adminUser,
  token,
}: PhysicianListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Queries
  const physicians = useQuery(api.admin.queries.getAllPhysicians, {
    adminToken: token,
  });

  // Get unique specializations for filter
  const getSpecializations = () => {
    if (!physicians) return [];
    const specializations = new Set(physicians.map((p) => p.specialization));
    return Array.from(specializations).sort();
  };

  // Get status counts
  const totalPhysicians = physicians?.length || 0;
  const activePhysicians = physicians?.filter((p) => p.isActive).length || 0;
  const pendingPhysicians =
    physicians?.filter((p) => !p.verifiedAt).length || 0;
  const inactivePhysicians =
    physicians?.filter((p) => !p.isActive && p.verifiedAt).length || 0;

  const filteredPhysicians = physicians?.filter((p: Physician) => {
    const matchesSearch =
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.facilityName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      specializationFilter === "all" ||
      p.specialization === specializationFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive && p.verifiedAt) ||
      (statusFilter === "pending" && !p.verifiedAt);

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const getStatusColor = (physician: Physician) => {
    if (!physician.verifiedAt)
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (physician.isActive)
      return "bg-green-100 text-green-700 border-green-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getStatusIcon = (physician: Physician) => {
    if (!physician.verifiedAt) return <Clock className="w-4 h-4" />;
    if (physician.isActive) return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getStatusText = (physician: Physician) => {
    if (!physician.verifiedAt) return "Pending";
    if (physician.isActive) return "Active";
    return "Inactive";
  };

  // Detail View
  if (showDetails && selectedPhysician) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setShowDetails(false);
              setSelectedPhysician(null);
            }}
            variant="outline"
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Physician Profile
          </h2>
          <div className="w-16 sm:w-24"></div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Dr. {selectedPhysician.user?.name}
                  </h3>
                  <p className="text-gray-500">
                    {selectedPhysician.specialization}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border w-fit ${getStatusColor(selectedPhysician)}`}
              >
                {getStatusIcon(selectedPhysician)}
                {getStatusText(selectedPhysician)}
              </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">License</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedPhysician.licenseNumber}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <Briefcase className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Experience</p>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedPhysician.yearsOfExperience} years
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <Building2 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Facility</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedPhysician.facilityName || "—"}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <Calendar className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-semibold text-gray-800">
                  {format(new Date(selectedPhysician.joinedAt), "MMM yyyy")}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Contact Information
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedPhysician.user?.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedPhysician.user?.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Qualifications
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedPhysician.qualifications.map((qual, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedPhysician.consultationFee && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                    <Star className="w-4 h-4 text-blue-500" />
                    Consultation Fee
                  </h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      KES {selectedPhysician.consultationFee}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Facility Location
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-sm">{selectedPhysician.facilityName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPhysician.facilityCity || "Location not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">
                Professional Timeline
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">
                    {format(new Date(selectedPhysician.joinedAt), "PPP")}
                  </span>
                </div>
                {selectedPhysician.verifiedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <BadgeCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium">
                      {format(new Date(selectedPhysician.verifiedAt), "PPP")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            Physician Directory
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {totalPhysicians} • Active: {activePhysicians} • Pending:{" "}
            {pendingPhysicians}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-1"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-1"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, specialization, license or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full sm:w-40"
        >
          <option value="all">All Specializations</option>
          {getSpecializations().map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full sm:w-36"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredPhysicians?.length || 0} of {totalPhysicians}{" "}
        physicians
      </div>

      {/* Physicians Grid/List */}
      {filteredPhysicians?.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Stethoscope className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
            No Physicians Found
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {searchTerm
              ? "Try adjusting your search filters"
              : "No physicians have been added yet"}
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPhysicians?.map((physician: Physician) => (
            <motion.div
              key={physician._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => {
                setSelectedPhysician(physician);
                setShowDetails(true);
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Dr. {physician.user?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {physician.specialization}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(physician)}`}
                  >
                    {getStatusIcon(physician)}
                    {getStatusText(physician)}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="truncate">
                      {physician.facilityName || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3 h-3 text-gray-400" />
                    <span>License: {physician.licenseNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-gray-400" />
                    <span>{physician.yearsOfExperience} years exp.</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <div className="flex gap-1">
                    {physician.qualifications.slice(0, 2).map((qual, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {qual.substring(0, 3)}...
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 text-xs"
                  >
                    View Profile
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredPhysicians?.map((physician: Physician) => (
            <motion.div
              key={physician._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedPhysician(physician);
                  setShowDetails(true);
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">
                        Dr. {physician.user?.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(physician)}`}
                      >
                        {getStatusIcon(physician)}
                        {getStatusText(physician)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <span>{physician.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{physician.facilityName || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {physician.user?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
