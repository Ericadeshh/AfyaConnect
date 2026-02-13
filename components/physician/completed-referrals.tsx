"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface CompletedReferralsPageProps {
  physician: any;
  onBack: () => void;
  token: string;
}

export default function CompletedReferralsPage({
  physician,
  onBack,
  token,
}: CompletedReferralsPageProps) {
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch completed referrals
  const completedReferrals = useQuery(
    api.referrals.queries.getCompletedReferrals,
    {
      token,
      physicianId: physician.id,
    },
  );

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
            <h1 className="text-2xl font-bold text-green-600">
              Completed Referral Details
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
                  {selectedReferral.completedAt && (
                    <p className="text-sm text-green-600">
                      Completed:{" "}
                      {format(new Date(selectedReferral.completedAt), "PPP")}
                    </p>
                  )}
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

              {selectedReferral.adminNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <p className="text-gray-700">{selectedReferral.adminNotes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
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
          <h1 className="text-2xl font-bold text-green-600">
            Completed Referrals
          </h1>
          <div className="w-20"></div>
        </div>

        {completedReferrals === undefined ? (
          <div className="text-center py-12">Loading...</div>
        ) : completedReferrals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              No completed referrals found
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedReferrals.map((referral) => (
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
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        Submitted:{" "}
                        {format(new Date(referral.submittedAt), "PPP")}
                      </span>
                      {referral.completedAt && (
                        <span>
                          Completed:{" "}
                          {format(new Date(referral.completedAt), "PPP")}
                        </span>
                      )}
                    </div>
                  </div>
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
