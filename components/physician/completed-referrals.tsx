"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight, Eye, Calendar, Clock } from "lucide-react";

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
                  <h2 className="text-base sm:text-xl font-semibold text-blue-700 break-words">
                    #{selectedReferral.referralNumber}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 sm:mt-2">
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Submitted:{" "}
                      {format(new Date(selectedReferral.submittedAt), "PP")}
                    </p>
                    {selectedReferral.completedAt && (
                      <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Completed:{" "}
                        {format(new Date(selectedReferral.completedAt), "PP")}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${getUrgencyColor(selectedReferral.urgency)}`}
                >
                  {selectedReferral.urgency.charAt(0).toUpperCase() +
                    selectedReferral.urgency.slice(1)}
                </span>
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

              {selectedReferral.adminNotes && (
                <div className="bg-blue-50/30 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-600 mb-2">
                    Admin Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {selectedReferral.adminNotes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-3 sm:pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  size="sm"
                  className="sm:size-default text-xs sm:text-sm"
                >
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
            Completed Referrals
          </h1>
          <div className="w-10 sm:w-20"></div>
        </div>

        {completedReferrals === undefined ? (
          <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
            Loading...
          </div>
        ) : completedReferrals.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <p className="text-sm sm:text-lg text-gray-500">
              No completed referrals found
            </p>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {completedReferrals.map((referral) => (
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
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}
                      >
                        {referral.urgency}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">
                      #{referral.referralNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      To: {referral.referredToFacility}
                      {referral.referredToDepartment &&
                        ` - ${referral.referredToDepartment}`}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Submitted:{" "}
                        {format(new Date(referral.submittedAt), "PP")}
                      </span>
                      {referral.completedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-500" />
                          Completed:{" "}
                          {format(new Date(referral.completedAt), "PP")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-end sm:self-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReferral(referral);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs sm:text-sm">View</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
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
