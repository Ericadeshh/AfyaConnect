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
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  X,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Star,
  Filter,
} from "lucide-react";

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
}

interface Facility {
  _id: Id<"facilities">;
  name: string;
  city: string;
}

interface PhysicianManagementProps {
  adminUser: any;
  token: string;
}

type ViewMode = "list" | "details" | "add" | "edit";

export default function PhysicianManagement({
  adminUser,
  token,
}: PhysicianManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Queries
  const physicians = useQuery(api.admin.queries.getAllPhysicians, {
    adminToken: token,
  });

  const facilities = useQuery(api.admin.queries.getAllFacilities, {
    adminToken: token,
  });

  // Mutations
  const verifyPhysician = useMutation(
    api.admin.physicianMutations.verifyPhysician,
  );
  const assignToFacility = useMutation(
    api.admin.physicianMutations.assignPhysicianToFacility,
  );

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    licenseNumber: "",
    specialization: "",
    qualifications: [] as string[],
    yearsOfExperience: "",
    consultationFee: "",
    facilityId: "" as Id<"facilities">,
  });

  const [newQualification, setNewQualification] = useState("");
  const [selectedFacility, setSelectedFacility] =
    useState<Id<"facilities"> | null>(null);
  const [assigningId, setAssigningId] =
    useState<Id<"physicianProfiles"> | null>(null);

  // Get unique specializations for filter
  const getSpecializations = () => {
    if (!physicians) return [];
    const specializations = new Set(physicians.map((p) => p.specialization));
    return Array.from(specializations);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addQualification = () => {
    if (
      newQualification.trim() &&
      !formData.qualifications.includes(newQualification.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()],
      }));
      setNewQualification("");
    }
  };

  const removeQualification = (qual: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q !== qual),
    }));
  };

  const handleVerify = async (
    profileId: Id<"physicianProfiles">,
    isVerified: boolean,
  ) => {
    try {
      await verifyPhysician({
        adminToken: token,
        adminId: adminUser.id,
        physicianProfileId: profileId,
        isVerified,
      });
    } catch (error) {
      console.error("Error verifying physician:", error);
    }
  };

  const handleAssignFacility = async (profileId: Id<"physicianProfiles">) => {
    if (!selectedFacility) return;

    setAssigningId(profileId);
    try {
      await assignToFacility({
        adminToken: token,
        adminId: adminUser.id,
        physicianProfileId: profileId,
        facilityId: selectedFacility,
      });
      setSelectedFacility(null);
    } catch (error) {
      console.error("Error assigning physician:", error);
    } finally {
      setAssigningId(null);
    }
  };

  const filteredPhysicians = physicians?.filter((p: Physician) => {
    const matchesSearch =
      p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      specializationFilter === "all" ||
      p.specialization === specializationFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive) ||
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

  // Details View
  if (viewMode === "details" && selectedPhysician) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setViewMode("list");
              setSelectedPhysician(null);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">
            Physician Details
          </h2>
          <div className="w-24"></div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Dr. {selectedPhysician.user?.name}
                  </h3>
                  <p className="text-gray-500">
                    {selectedPhysician.specialization} • License:{" "}
                    {selectedPhysician.licenseNumber}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${getStatusColor(selectedPhysician)}`}
              >
                {getStatusIcon(selectedPhysician)}
                {getStatusText(selectedPhysician)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">
                  Contact Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{selectedPhysician.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>
                      {selectedPhysician.user?.phoneNumber || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">
                  Professional Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>
                      Experience: {selectedPhysician.yearsOfExperience} years
                    </span>
                  </div>
                  {selectedPhysician.consultationFee && (
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-gray-400" />
                      <span>
                        Consultation Fee: KES{" "}
                        {selectedPhysician.consultationFee}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Facility</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span>
                      {selectedPhysician.facilityName || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Qualifications</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedPhysician.qualifications.map((qual, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">
                    {new Date(selectedPhysician.joinedAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedPhysician.verifiedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium">
                      {new Date(
                        selectedPhysician.verifiedAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {!selectedPhysician.verifiedAt && (
                <>
                  <Button
                    onClick={() => handleVerify(selectedPhysician._id, true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Physician
                  </Button>
                  <Button
                    onClick={() => handleVerify(selectedPhysician._id, false)}
                    variant="outline"
                    className="text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {/* Facility Assignment */}
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  onChange={(e) =>
                    setSelectedFacility(e.target.value as Id<"facilities">)
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    Change facility
                  </option>
                  {facilities?.map((f: Facility) => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => handleAssignFacility(selectedPhysician._id)}
                  disabled={
                    !selectedFacility || assigningId === selectedPhysician._id
                  }
                  variant="outline"
                  size="sm"
                >
                  {assigningId === selectedPhysician._id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Assign"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Add Physician View
  if (viewMode === "add") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setViewMode("list")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">
            Add New Physician
          </h2>
          <div className="w-24"></div>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <XCircle className="w-5 h-5" />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="dr.smith@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+254 XXX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  required
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="MED-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  required
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee (KES)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility *
                </label>
                <select
                  name="facilityId"
                  required
                  value={formData.facilityId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Facility</option>
                  {facilities
                    ?.filter((f: any) => f.status === "active")
                    .map((f: any) => (
                      <option key={f._id} value={f._id}>
                        {f.name} - {f.city}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualifications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., MBChB, MMed (Cardiology)"
                />
                <Button
                  type="button"
                  onClick={addQualification}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.qualifications.map((qual) => (
                  <span
                    key={qual}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {qual}
                    <button
                      type="button"
                      onClick={() => removeQualification(qual)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewMode("list")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Physician
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // List View (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-500" />
            Physician Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {physicians?.length || 0} physicians • Active:{" "}
            {physicians?.filter((p: Physician) => p.isActive).length || 0} •
            Pending:{" "}
            {physicians?.filter((p: Physician) => !p.verifiedAt).length || 0}
          </p>
        </div>
        <Button
          onClick={() => setViewMode("add")}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Physician
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search physicians by name, specialization or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending Verification</option>
        </select>
      </div>

      {/* Physicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhysicians?.map((physician: Physician) => (
          <motion.div
            key={physician._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
            onClick={() => {
              setSelectedPhysician(physician);
              setViewMode("details");
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Dr. {physician.user?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {physician.specialization}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(physician)}`}
                >
                  {getStatusIcon(physician)}
                  {getStatusText(physician)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{physician.user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="truncate">
                    {physician.facilityName || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>License: {physician.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{physician.yearsOfExperience} years exp.</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhysician(physician);
                    setViewMode("details");
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPhysicians?.length === 0 && (
        <Card className="p-12 text-center">
          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Physicians Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first physician"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setViewMode("add")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Physician
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
