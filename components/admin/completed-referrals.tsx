"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  User,
  Building2,
  Calendar,
  Activity,
  ChevronRight,
  Eye,
  Download,
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

interface CompletedReferralsPageProps {
  physician: any;
  onBack: () => void;
  token: string;
}

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
  completedAt?: string;
  physicianNotes?: string;
}

export default function CompletedReferralsPage({
  physician,
  onBack,
  token,
}: CompletedReferralsPageProps) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

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
        return "text-red-600 bg-red-50 border-red-200";
      case "urgent":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const filterByDate = (referral: Referral) => {
    if (dateFilter === "all") return true;
    const date = new Date(referral.completedAt || referral.submittedAt);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case "today":
        return format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "week":
        return date >= weekAgo;
      case "month":
        return date >= monthAgo;
      default:
        return true;
    }
  };

  const filteredReferrals = completedReferrals?.filter((referral: Referral) => {
    const matchesSearch =
      referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.referredToFacility
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch && filterByDate(referral);
  });

  if (showDetails && selectedReferral) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              onClick={() => setShowDetails(false)}
              variant="outline"
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
          </div>

          {/* Details Card */}
          <Card className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      #{selectedReferral.referralNumber}
                    </h2>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getUrgencyColor(selectedReferral.urgency)}`}
                    >
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      {selectedReferral.urgency}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Completed:{" "}
                    {format(
                      new Date(
                        selectedReferral.completedAt ||
                          selectedReferral.submittedAt,
                      ),
                      "PPP",
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Download PDF
                </Button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Patient Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                    <User className="w-4 h-4 text-blue-500" />
                    Patient Information
                  </h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-sm">
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

                {/* Medical Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Medical Information
                  </h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 text-sm">
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

                {/* Facility Info */}
                <div className="space-y-2 sm:col-span-2">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Receiving Facility
                  </h3>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-sm">
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

              {/* Notes */}
              {selectedReferral.physicianNotes && (
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-1 text-sm sm:text-base">
                    Your Notes
                  </p>
                  <p className="text-blue-600 text-sm">
                    {selectedReferral.physicianNotes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-green-600 text-center sm:text-left">
            Completed Referrals
          </h1>
          <div className="hidden sm:block w-24"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by patient, referral # or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Stats Summary - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="p-3 sm:p-4 bg-linear-to-br from-green-50 to-green-100">
            <p className="text-xs sm:text-sm text-green-600">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-green-700">
              {completedReferrals?.length || 0}
            </p>
          </Card>
          <Card className="p-3 sm:p-4 bg-linear-to-br from-blue-50 to-blue-100">
            <p className="text-xs sm:text-sm text-blue-600">This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-700">
              {completedReferrals?.filter(
                (r: Referral) =>
                  new Date(r.completedAt || r.submittedAt) >=
                  new Date(new Date().setDate(1)),
              ).length || 0}
            </p>
          </Card>
        </div>

        {/* Referrals List */}
        {filteredReferrals?.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
              No Completed Referrals
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Your completed referrals will appear here
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
                          className={`px-2 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${getUrgencyColor(referral.urgency)}`}
                        >
                          {referral.urgency}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        #{referral.referralNumber}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        To: {referral.referredToFacility}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {format(new Date(referral.submittedAt), "PP")}
                        </span>
                        {referral.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                            Completed
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
        )}
      </div>
    </div>
  );
}
