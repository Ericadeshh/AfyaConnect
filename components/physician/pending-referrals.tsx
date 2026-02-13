"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

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

  if (showDetails && selectedReferral) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button onClick={() => setShowDetails(false)} variant="outline">
              ← Back to List
            </Button>
            <h1 className="text-2xl font-bold text-primary">
              Referral Details
            </h1>
            <div className="w-20"></div>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    Referral #{selectedReferral.referralNumber}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    {format(new Date(selectedReferral.submittedAt), "PPP")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(selectedReferral.urgency)}`}
                >
                  {selectedReferral.urgency.charAt(0).toUpperCase() +
                    selectedReferral.urgency.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    {selectedReferral.patientName}
                  </p>
                  <p>
                    <span className="text-gray-600">Age:</span>{" "}
                    {selectedReferral.patientAge}
                  </p>
                  <p>
                    <span className="text-gray-600">Gender:</span>{" "}
                    {selectedReferral.patientGender}
                  </p>
                  <p>
                    <span className="text-gray-600">Contact:</span>{" "}
                    {selectedReferral.patientContact}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Receiving Facility</h3>
                  <p>
                    <span className="text-gray-600">Facility:</span>{" "}
                    {selectedReferral.referredToFacility}
                  </p>
                  {selectedReferral.referredToDepartment && (
                    <p>
                      <span className="text-gray-600">Department:</span>{" "}
                      {selectedReferral.referredToDepartment}
                    </p>
                  )}
                  {selectedReferral.referredToPhysician && (
                    <p>
                      <span className="text-gray-600">Physician:</span>{" "}
                      {selectedReferral.referredToPhysician}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Medical Information</h3>
                <p>
                  <span className="text-gray-600">Diagnosis:</span>{" "}
                  {selectedReferral.diagnosis}
                </p>
                <p>
                  <span className="text-gray-600">Clinical Summary:</span>{" "}
                  {selectedReferral.clinicalSummary}
                </p>
                <p>
                  <span className="text-gray-600">Reason for Referral:</span>{" "}
                  {selectedReferral.reasonForReferral}
                </p>
              </div>

              {selectedReferral.physicianNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Physician Notes</h3>
                  <p className="text-gray-700">
                    {selectedReferral.physicianNotes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetails(false);
                    handleCancel(selectedReferral._id);
                  }}
                  disabled={cancellingId === selectedReferral._id}
                >
                  {cancellingId === selectedReferral._id
                    ? "Cancelling..."
                    : "Cancel Referral"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-primary">Pending Referrals</h1>
          <div className="w-20"></div>
        </div>

        {pendingReferrals === undefined ? (
          <div className="text-center py-12">Loading...</div>
        ) : pendingReferrals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No pending referrals found</p>
            <Button
              onClick={() => onBack()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create New Referral
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingReferrals.map((referral) => (
              <Card
                key={referral._id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {referral.patientName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}
                      >
                        {referral.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Referral #{referral.referralNumber}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      To: {referral.referredToFacility}
                      {referral.referredToDepartment &&
                        ` - ${referral.referredToDepartment}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {format(new Date(referral.submittedAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral);
                        setShowDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleCancel(referral._id as Id<"referrals">)
                      }
                      disabled={cancellingId === referral._id}
                    >
                      {cancellingId === referral._id ? "..." : "Cancel"}
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
