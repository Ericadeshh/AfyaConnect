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
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Loader2,
  CheckCircle2,
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
  status: string;
  submittedAt: string;
  physicianNotes?: string;
  adminNotes?: string;
}

export default function PendingPhysicianReferrals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { token } = useAuth();

  // Queries
  const pendingReferrals = useQuery(
    api.referrals.queries.getPendingReferralsAdmin,
    {
      adminToken: token || "",
    },
  );

  // Mutations
  const approveReferral = useMutation(api.referrals.mutations.approveReferral);
  const rejectReferral = useMutation(api.referrals.mutations.rejectReferral);

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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "urgent":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
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
      setSuccessMessage("Referral approved successfully!");
      setShowSuccess(true);
      setApprovalNotes("");
      setShowDetails(false);
      setSelectedReferral(null);
      setTimeout(() => setShowSuccess(false), 3000);
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
      setSuccessMessage("Referral rejected successfully!");
      setShowSuccess(true);
      setApprovalNotes("");
      setShowDetails(false);
      setSelectedReferral(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error rejecting referral:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReferrals = pendingReferrals?.filter((referral: Referral) => {
    return (
      referral.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referringPhysicianName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referredToFacility
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

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
                    {getUrgencyIcon(selectedReferral.urgency)}
                    {selectedReferral.urgency}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Submitted:{" "}
                  {format(new Date(selectedReferral.submittedAt), "PPP 'at' p")}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Patient Info */}
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

              {/* Referring Physician */}
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

              {/* Medical Info */}
              <div className="space-y-2 sm:col-span-2">
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

              {/* Receiving Facility */}
              <div className="space-y-2 sm:col-span-2">
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

            {/* Physician Notes */}
            {selectedReferral.physicianNotes && (
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1 text-sm sm:text-base">
                  Physician Notes
                </p>
                <p className="text-blue-600 text-xs sm:text-sm">
                  {selectedReferral.physicianNotes}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            <div className="p-4 sm:p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-3 text-sm sm:text-base">
                Admin Action Required
              </h4>
              <div className="space-y-3">
                <textarea
                  placeholder="Add approval notes or reason for rejection (optional)"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleApprove(selectedReferral._id)}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Referral
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedReferral._id)}
                    disabled={isProcessing}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject Referral
                  </Button>
                </div>
              </div>
            </div>
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
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          Pending Referrals
        </h2>
        <div className="text-xs sm:text-sm text-gray-500">
          {pendingReferrals?.length || 0} awaiting approval
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by patient, referral #, physician or facility..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Referrals List */}
      {pendingReferrals === undefined ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
        </div>
      ) : filteredReferrals?.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
            No Pending Referrals
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            All caught up! No referrals awaiting approval.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredReferrals?.map((referral: Referral) => (
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
                        {getUrgencyIcon(referral.urgency)}
                        {referral.urgency}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      #{referral.referralNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      From: Dr. {referral.referringPhysicianName} • To:{" "}
                      {referral.referredToFacility}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      {format(new Date(referral.submittedAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                    >
                      <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                    >
                      <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      Reject
                    </Button>
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
