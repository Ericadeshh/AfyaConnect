"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Eye,
  ChevronRight,
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CheckCheck,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface Referral {
  _id: Id<"referrals">;
  referralNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientContact: string;
  referringPhysicianId: Id<"users">;
  referringPhysicianName: string;
  referringHospital: string;
  diagnosis: string;
  clinicalSummary: string;
  reasonForReferral: string;
  urgency: "routine" | "urgent" | "emergency";
  referredToFacility: string;
  referredToDepartment?: string;
  referredToPhysician?: string;
  status:
    | "pending"
    | "approved"
    | "forwarded"
    | "completed"
    | "rejected"
    | "cancelled";
  submittedAt: string;
  approvedAt?: string;
  completedAt?: string;
  physicianNotes?: string;
  adminNotes?: string;
}

const ITEMS_PER_PAGE = 5;

export default function AdminReferrals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { token } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Queries
  const allReferrals = useQuery(api.referrals.queries.getAllReferralsAdmin, {
    adminToken: token || "",
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  // Filter referrals
  const filteredReferrals = allReferrals?.filter((referral: Referral) => {
    const matchesSearch =
      referral.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referringPhysicianName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referredToFacility
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const displayedReferrals = filteredReferrals?.slice(0, displayCount);
  const hasMore = filteredReferrals
    ? displayCount < filteredReferrals.length
    : false;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
          }
        },
        { threshold: 0.5 },
      );
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasMore]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCheck className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <ThumbsUp className="w-4 h-4" />;
      case "rejected":
        return <ThumbsDown className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "text-red-600 bg-red-50 border-red-200";
      case "urgent":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  // Show success message (can be called from parent or via event)
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (showDetails && selectedReferral) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setShowDetails(false);
              setSelectedReferral(null);
            }}
            variant="outline"
            className="flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Referral Details
          </h2>
          <div className="w-16 sm:w-24"></div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                    #{selectedReferral.referralNumber}
                  </h3>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getUrgencyColor(selectedReferral.urgency)}`}
                  >
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {selectedReferral.urgency}
                  </span>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getStatusColor(selectedReferral.status)}`}
                  >
                    {getStatusIcon(selectedReferral.status)}
                    {selectedReferral.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Submitted:{" "}
                  {format(new Date(selectedReferral.submittedAt), "PPP 'at' p")}
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Download PDF
              </Button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4 text-blue-500" />
                  Patient Information
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-xs sm:text-sm">
                  <p>
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedReferral.patientName}
                  </p>
                  <p>
                    <span className="text-gray-500">Age:</span>{" "}
                    {selectedReferral.patientAge}
                  </p>
                  <p>
                    <span className="text-gray-500">Gender:</span>{" "}
                    {selectedReferral.patientGender}
                  </p>
                  <p>
                    <span className="text-gray-500">Contact:</span>{" "}
                    {selectedReferral.patientContact}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Referring Physician
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-xs sm:text-sm">
                  <p>
                    <span className="text-gray-500">Name:</span> Dr.{" "}
                    {selectedReferral.referringPhysicianName}
                  </p>
                  <p>
                    <span className="text-gray-500">Hospital:</span>{" "}
                    {selectedReferral.referringHospital}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Medical Information
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-xs sm:text-sm">
                  <p>
                    <span className="text-gray-500">Diagnosis:</span>{" "}
                    {selectedReferral.diagnosis}
                  </p>
                  <p>
                    <span className="text-gray-500">Summary:</span>{" "}
                    {selectedReferral.clinicalSummary}
                  </p>
                  <p>
                    <span className="text-gray-500">Reason:</span>{" "}
                    {selectedReferral.reasonForReferral}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Receiving Facility
                </h4>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                  <p>
                    <span className="text-gray-500">Facility:</span>{" "}
                    {selectedReferral.referredToFacility}
                  </p>
                  {selectedReferral.referredToDepartment && (
                    <p>
                      <span className="text-gray-500">Department:</span>{" "}
                      {selectedReferral.referredToDepartment}
                    </p>
                  )}
                  {selectedReferral.referredToPhysician && (
                    <p>
                      <span className="text-gray-500">Physician:</span>{" "}
                      {selectedReferral.referredToPhysician}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">
                    {format(new Date(selectedReferral.submittedAt), "PPP p")}
                  </span>
                </div>
                {selectedReferral.approvedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium">
                      {format(new Date(selectedReferral.approvedAt), "PPP p")}
                    </span>
                  </div>
                )}
                {selectedReferral.completedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCheck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">
                      {format(new Date(selectedReferral.completedAt), "PPP p")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedReferral.physicianNotes && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">
                  Physician Notes
                </p>
                <p className="text-blue-600 text-sm">
                  {selectedReferral.physicianNotes}
                </p>
              </div>
            )}

            {selectedReferral.adminNotes && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-800 mb-1">Admin Notes</p>
                <p className="text-purple-600 text-sm">
                  {selectedReferral.adminNotes}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          All Referrals
        </h2>
        <div className="text-xs sm:text-sm text-gray-500">
          Total: {allReferrals?.length || 0} referrals
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by patient, referral #, physician or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Referrals List */}
      {allReferrals === undefined ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        </div>
      ) : displayedReferrals?.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
            No Referrals Found
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {searchTerm
              ? "Try adjusting your search"
              : "No referrals match the selected filters"}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {displayedReferrals?.map((referral: Referral) => (
              <motion.div
                key={referral._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {referral.patientName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor(referral.urgency)}`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {referral.urgency}
                        </span>
                        <span
                          className={`px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(referral.status)}`}
                        >
                          {getStatusIcon(referral.status)}
                          {referral.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        #{referral.referralNumber}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        From: Dr. {referral.referringPhysicianName} • To:{" "}
                        {referral.referredToFacility}
                      </p>
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {format(new Date(referral.submittedAt), "PP")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
            </div>
          )}

          {/* Items counter */}
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Showing {displayedReferrals.length} of {filteredReferrals?.length}{" "}
            referrals
          </div>
        </>
      )}
    </div>
  );
}
