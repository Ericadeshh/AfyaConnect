"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

interface PendingReferralsPageProps {
  physician: any;
  onBack: () => void;
  token: string;
}

export default function PendingReferralsPage({
  physician,
  onBack,
  token,
}: PendingReferralsPageProps) {
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cancellingId, setCancellingId] = useState<Id<"referrals"> | null>(
    null,
  );

  // Fetch pending referrals
  const pendingReferrals = useQuery(api.referrals.queries.getPendingReferrals, {
    token,
    physicianId: physician.id,
  });

  const cancelReferral = useMutation(api.referrals.mutations.cancelReferral);

  const handleCancel = async (referralId: Id<"referrals">) => {
    if (!confirm("Are you sure you want to cancel this referral?")) {
      return;
    }

    setCancellingId(referralId);
    try {
      await cancelReferral({
        token,
        physicianId: physician.id,
        referralId,
        cancellationReason: "Cancelled by physician",
      });
      // Refresh will happen automatically via Convex
    } catch (error) {
      console.error("Error cancelling referral:", error);
      alert("Failed to cancel referral");
    } finally {
      setCancellingId(null);
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "urgent":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return null;
    }
  };

  if (showDetails && selectedReferral) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              size="sm"
              className="sm:size-default text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to List</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-blue-600">
              Referral Details
            </h1>
            <div className="w-10 sm:w-20"></div>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                <div>
                  <h2 className="text-base sm:text-xl font-semibold text-blue-700 wrap-break-word">
                    #{selectedReferral.referralNumber}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Submitted:{" "}
                    {format(new Date(selectedReferral.submittedAt), "PPP")}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor(selectedReferral.urgency)}`}
                  >
                    {getUrgencyIcon(selectedReferral.urgency)}
                    {selectedReferral.urgency.charAt(0).toUpperCase() +
                      selectedReferral.urgency.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-2 sm:mb-3">
                    Patient Information
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm">
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

                <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-2 sm:mb-3">
                    Receiving Facility
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm">
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

              <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-2 sm:mb-3">
                  Medical Information
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p>
                    <span className="text-gray-500">Diagnosis:</span>{" "}
                    {selectedReferral.diagnosis}
                  </p>
                  <p>
                    <span className="text-gray-500">Clinical Summary:</span>{" "}
                    {selectedReferral.clinicalSummary}
                  </p>
                  <p>
                    <span className="text-gray-500">Reason for Referral:</span>{" "}
                    {selectedReferral.reasonForReferral}
                  </p>
                </div>
              </div>

              {selectedReferral.physicianNotes && (
                <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-2">
                    Physician Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {selectedReferral.physicianNotes}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  size="sm"
                  className="sm:size-default text-xs sm:text-sm w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="sm:size-default text-xs sm:text-sm w-full sm:w-auto"
                  onClick={() => {
                    setShowDetails(false);
                    handleCancel(selectedReferral._id);
                  }}
                  disabled={cancellingId === selectedReferral._id}
                >
                  {cancellingId === selectedReferral._id ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Cancel Referral
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="sm:size-default text-xs sm:text-sm px-2 sm:px-4"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold text-blue-600">
            Pending Referrals
          </h1>
          <div className="w-10 sm:w-20"></div>
        </div>

        {pendingReferrals === undefined ? (
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500 mx-auto" />
          </div>
        ) : pendingReferrals.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-lg text-gray-500 mb-4">
              No pending referrals found
            </p>
            <Button
              onClick={() => onBack()}
              size="sm"
              className="sm:size-default text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create New Referral
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pendingReferrals.map((referral) => (
              <Card
                key={referral._id}
                className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedReferral(referral);
                  setShowDetails(true);
                }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-blue-700">
                        {referral.patientName}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getUrgencyIcon(referral.urgency)}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}
                        >
                          {referral.urgency}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 wrap-break-word">
                      #{referral.referralNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      To: {referral.referredToFacility}
                      {referral.referredToDepartment &&
                        ` - ${referral.referredToDepartment}`}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Submitted: {format(new Date(referral.submittedAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="text-xs sm:text-sm">View</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(referral._id as Id<"referrals">);
                      }}
                      disabled={cancellingId === referral._id}
                    >
                      {cancellingId === referral._id ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="ml-1 text-xs sm:text-sm hidden sm:inline">
                        Cancel
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
