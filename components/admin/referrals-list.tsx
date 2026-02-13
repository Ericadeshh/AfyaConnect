"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Activity,
  ChevronRight,
  Eye,
  Search,
  Filter,
  Download,
  Printer,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { format } from "date-fns";

// Define the referral type with proper ID
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
  [key: string]: any;
}

export default function ReferralsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { token } = useAuth();

  // Queries
  const referrals = useQuery(api.referrals.queries.getAllReferralsAdmin, {
    adminToken: token || "",
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  // Mutations
  const approveReferral = useMutation(api.referrals.mutations.approveReferral);
  const rejectReferral = useMutation(api.referrals.mutations.rejectReferral);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "approved":
        return "text-blue-600 bg-blue-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "cancelled":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
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
        return "text-red-600 bg-red-50";
      case "urgent":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const handleApprove = async (referralId: Id<"referrals">) => {
    setIsProcessing(true);
    try {
      await approveReferral({
        adminToken: token,
        referralId,
        adminNotes: approvalNotes,
      });
      setApprovalNotes("");
      setShowDetails(false);
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error approving referral:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (referralId: Id<"referrals">) => {
    setIsProcessing(true);
    try {
      await rejectReferral({
        adminToken: token,
        referralId,
        rejectionReason: approvalNotes || "Referral rejected by admin",
      });
      setApprovalNotes("");
      setShowDetails(false);
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error rejecting referral:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReferrals = referrals?.filter((referral: any) => {
    return (
      referral.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referringPhysicianName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  if (showDetails && selectedReferral) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setShowDetails(false)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to List
        </Button>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Referral #{selectedReferral.referralNumber}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(selectedReferral.status)}`}
                  >
                    {getStatusIcon(selectedReferral.status)}
                    {selectedReferral.status}
                  </span>
                </div>
                <p className="text-gray-500">
                  Submitted:{" "}
                  {format(new Date(selectedReferral.submittedAt), "PPP 'at' p")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getUrgencyColor(selectedReferral.urgency)}`}
              >
                <AlertCircle className="w-4 h-4" />
                {selectedReferral.urgency}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Patient Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Referring Physician
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Medical Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Receiving Facility
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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

            {selectedReferral.physicianNotes && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">
                  Physician Notes
                </p>
                <p className="text-blue-600">
                  {selectedReferral.physicianNotes}
                </p>
              </div>
            )}

            {/* Approval Section - Only show for pending referrals */}
            {selectedReferral.status === "pending" && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-3">
                  Admin Action Required
                </h3>
                <div className="space-y-3">
                  <textarea
                    placeholder="Add approval notes or reason for rejection (optional)"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedReferral._id)}
                      disabled={isProcessing}
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve Referral
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedReferral._id)}
                      disabled={isProcessing}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject Referral
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Referrals Management
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All Referrals</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-linear-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">
            {referrals?.filter((r: any) => r.status === "pending").length || 0}
          </p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-600">Approved</p>
          <p className="text-2xl font-bold text-blue-700">
            {referrals?.filter((r: any) => r.status === "approved").length || 0}
          </p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">
            {referrals?.filter((r: any) => r.status === "completed").length ||
              0}
          </p>
        </Card>
        <Card className="p-4 bg-linear-to-br from-red-50 to-red-100">
          <p className="text-sm text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">
            {referrals?.filter(
              (r: any) => r.status === "rejected" || r.status === "cancelled",
            ).length || 0}
          </p>
        </Card>
      </div>

      {/* Referrals List */}
      {filteredReferrals?.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Referrals Found
          </h3>
          <p className="text-gray-500">
            No referrals match your current filters
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReferrals?.map((referral: any) => (
            <motion.div
              key={referral._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">
                        {referral.patientName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}
                      >
                        {referral.urgency}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(referral.status)}`}
                      >
                        {getStatusIcon(referral.status)}
                        {referral.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Referral #{referral.referralNumber}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      From: Dr. {referral.referringPhysicianName} • To:{" "}
                      {referral.referredToFacility}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(referral.submittedAt), "PP")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    {referral.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowDetails(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowDetails(true);
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
