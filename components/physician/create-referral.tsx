"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Activity,
  Building2,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  Search,
  MapPin,
  X,
} from "lucide-react";

interface CreateReferralPageProps {
  physician: any;
  onBack: () => void;
  token: string;
}

interface Facility {
  _id: Id<"facilities">;
  name: string;
  type: string;
  address: string;
  city: string;
  county: string;
  phone: string;
  email: string;
  services: string[];
  departments: string[];
  bedCapacity?: number;
  emergencyServices: boolean;
  operatingHours: string;
  status: string;
}

interface Physician {
  _id: Id<"physicianProfiles">;
  userId: Id<"users">;
  facilityId: Id<"facilities">;
  specialization: string;
  qualifications: string[];
  user?: {
    name: string;
  };
}

type FormStep = "patient" | "medical" | "facility" | "review";

export default function CreateReferralPage({
  physician,
  onBack,
  token,
}: CreateReferralPageProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Search and filter states
  const [facilitySearch, setFacilitySearch] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(
    null,
  );
  const [showPhysicianDropdown, setShowPhysicianDropdown] = useState(false);
  const [physicianSearch, setPhysicianSearch] = useState("");

  // Fetch real data from Convex - PUBLIC QUERIES (no token needed)
  const facilities = useQuery(api.facilities.queries.getActiveFacilities);

  const physiciansByFacility = useQuery(
    api.facilities.queries.getPhysiciansByFacility,
    selectedFacility ? { facilityId: selectedFacility._id } : "skip",
  );

  const createReferral = useMutation(api.referrals.mutations.createReferral);

  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientContact: "",

    // Medical Information
    diagnosis: "",
    clinicalSummary: "",
    reasonForReferral: "",
    urgency: "routine",

    // Facility Information
    referredToFacility: "",
    referredToDepartment: "",
    referredToPhysician: "",

    // Additional
    physicianNotes: "",
  });

  // Filter active facilities
  const activeFacilities = facilities || [];

  // Filter facilities based on search
  const filteredFacilities = activeFacilities.filter(
    (f) =>
      f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      f.city.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      f.county.toLowerCase().includes(facilitySearch.toLowerCase()),
  );

  // Get departments for selected facility
  const facilityDepartments = selectedFacility?.departments || [];

  // Get physicians for selected facility
  const facilityPhysicians = physiciansByFacility || [];

  // Filter physicians based on search
  const filteredPhysicians = facilityPhysicians.filter(
    (p) =>
      p.user?.name?.toLowerCase().includes(physicianSearch.toLowerCase()) ||
      p.specialization.toLowerCase().includes(physicianSearch.toLowerCase()),
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setFormData((prev) => ({
      ...prev,
      referredToFacility: facility.name,
      referredToDepartment: "",
      referredToPhysician: "",
    }));
    setSelectedDepartment("");
    setSelectedPhysician(null);
    setShowFacilityDropdown(false);
    setFacilitySearch("");
  };

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department);
    setFormData((prev) => ({
      ...prev,
      referredToDepartment: department,
    }));
  };

  const handlePhysicianSelect = (physician: Physician) => {
    setSelectedPhysician(physician);
    setFormData((prev) => ({
      ...prev,
      referredToPhysician: physician.user?.name || "",
    }));
    setShowPhysicianDropdown(false);
    setPhysicianSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createReferral({
        token,
        physicianId: physician.id,

        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        patientContact: formData.patientContact,

        diagnosis: formData.diagnosis,
        clinicalSummary: formData.clinicalSummary,
        reasonForReferral: formData.reasonForReferral,
        urgency: formData.urgency as "routine" | "urgent" | "emergency",

        referredToFacility: formData.referredToFacility,
        referredToDepartment: formData.referredToDepartment || undefined,
        referredToPhysician: formData.referredToPhysician || undefined,

        physicianNotes: formData.physicianNotes || undefined,
      });

      if (result.success) {
        setShowSuccessAnimation(true);
        setSuccess(`Referral created! #${result.referralNumber}`);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          onBack();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create referral");
    } finally {
      setIsSubmitting(false);
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

  const steps = [
    { id: "patient", label: "Patient", icon: User },
    { id: "medical", label: "Medical", icon: Stethoscope },
    { id: "facility", label: "Facility", icon: Building2 },
    { id: "review", label: "Review", icon: FileText },
  ];

  const renderStepIndicator = () => (
    <div className="mb-6 sm:mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-[300px] sm:min-w-0 max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive
                      ? "#3B82F6"
                      : isCompleted
                        ? "#10B981"
                        : "#E5E7EB",
                  }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.div>
                <span
                  className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPatientStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Patient Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Full Name *
          </label>
          <input
            type="text"
            name="patientName"
            required
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Enter patient name"
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Age *
          </label>
          <input
            type="number"
            name="patientAge"
            required
            min="0"
            max="150"
            value={formData.patientAge}
            onChange={handleChange}
            placeholder="Age"
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" /> Gender *
          </label>
          <select
            name="patientGender"
            required
            value={formData.patientGender}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" /> Contact *
          </label>
          <input
            type="tel"
            name="patientContact"
            required
            value={formData.patientContact}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("medical")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderMedicalStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Medical Details
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-blue-500" /> Diagnosis *
        </label>
        <input
          type="text"
          name="diagnosis"
          required
          value={formData.diagnosis}
          onChange={handleChange}
          placeholder="Enter diagnosis"
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" /> Clinical Summary *
        </label>
        <textarea
          name="clinicalSummary"
          required
          rows={3}
          value={formData.clinicalSummary}
          onChange={handleChange}
          placeholder="Brief clinical summary"
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> Reason for Referral *
        </label>
        <textarea
          name="reasonForReferral"
          required
          rows={2}
          value={formData.reasonForReferral}
          onChange={handleChange}
          placeholder="Why is this patient being referred?"
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Urgency *
        </label>
        <div className="flex flex-wrap gap-2">
          {["routine", "urgent", "emergency"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, urgency: level }))
              }
              className={`px-3 sm:px-4 py-2 rounded-lg capitalize flex items-center gap-2 text-sm transition-all ${
                formData.urgency === level
                  ? getUrgencyColor(level)
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {level === "emergency" && <AlertTriangle className="w-4 h-4" />}
              {level === "urgent" && <Clock className="w-4 h-4" />}
              {level === "routine" && <Info className="w-4 h-4" />}
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("patient")}
          variant="outline"
          className="flex items-center gap-2 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep("facility")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderFacilityStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Receiving Facility
      </h2>

      {/* Facility Selection with Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" /> Facility *
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for a facility..."
            value={facilitySearch}
            onChange={(e) => {
              setFacilitySearch(e.target.value);
              setShowFacilityDropdown(true);
            }}
            onFocus={() => setShowFacilityDropdown(true)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Facility Dropdown */}
        <AnimatePresence>
          {showFacilityDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            >
              {filteredFacilities.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No facilities found
                </div>
              ) : (
                filteredFacilities.map((facility) => (
                  <div
                    key={facility._id}
                    onClick={() => handleFacilitySelect(facility)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {facility.name}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {facility.city}, {facility.county}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {facility.emergencyServices && (
                            <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                              24/7 Emergency
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                            {facility.services.length} services
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Facility Info */}
      {selectedFacility && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-blue-800">
                {selectedFacility.name}
              </h4>
              <p className="text-xs text-blue-600 mt-1">
                {selectedFacility.address}, {selectedFacility.city}
              </p>
              <p className="text-xs text-blue-600">{selectedFacility.phone}</p>
            </div>
            <button
              onClick={() => {
                setSelectedFacility(null);
                setFormData((prev) => ({
                  ...prev,
                  referredToFacility: "",
                  referredToDepartment: "",
                  referredToPhysician: "",
                }));
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Department Selection */}
      {selectedFacility && facilityDepartments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
            {facilityDepartments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => handleDepartmentSelect(dept)}
                className={`p-2 text-xs rounded-lg transition-all ${
                  selectedDepartment === dept
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Physician Selection */}
      {selectedFacility && facilityPhysicians.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Physician (Optional)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search physicians..."
              value={physicianSearch}
              onChange={(e) => {
                setPhysicianSearch(e.target.value);
                setShowPhysicianDropdown(true);
              }}
              onFocus={() => setShowPhysicianDropdown(true)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Physician Dropdown */}
          <AnimatePresence>
            {showPhysicianDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto"
              >
                {filteredPhysicians.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    No physicians found
                  </div>
                ) : (
                  filteredPhysicians.map((phys) => (
                    <div
                      key={phys._id}
                      onClick={() => handlePhysicianSelect(phys)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            Dr. {phys.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {phys.specialization}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedPhysician && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg flex justify-between items-center">
              <span className="text-sm text-green-700">
                Selected: Dr. {selectedPhysician.user?.name}
              </span>
              <button
                onClick={() => {
                  setSelectedPhysician(null);
                  setFormData((prev) => ({ ...prev, referredToPhysician: "" }));
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          name="physicianNotes"
          rows={2}
          value={formData.physicianNotes}
          onChange={handleChange}
          placeholder="Any additional information"
          className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("medical")}
          variant="outline"
          className="flex items-center gap-2 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep("review")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
          disabled={!selectedFacility}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-100">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          Review Referral
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">Patient</p>
            <p className="font-medium text-sm">{formData.patientName || "—"}</p>
            <p className="text-xs text-gray-600">
              {formData.patientAge} yrs • {formData.patientGender}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">Diagnosis</p>
            <p className="font-medium text-sm">{formData.diagnosis || "—"}</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${getUrgencyColor(formData.urgency)}`}
            >
              {formData.urgency}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg sm:col-span-2">
            <p className="text-xs text-gray-500">Receiving Facility</p>
            <p className="font-medium text-sm">
              {selectedFacility?.name || "—"}
            </p>
            {selectedDepartment && (
              <p className="text-xs text-gray-600">
                Dept: {selectedDepartment}
              </p>
            )}
            {selectedPhysician && (
              <p className="text-xs text-gray-600">
                Dr. {selectedPhysician.user?.name}
              </p>
            )}
          </div>

          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">Referring Physician</p>
            <p className="font-medium text-sm">Dr. {physician?.fullName}</p>
            <p className="text-xs text-gray-600">{physician?.hospital}</p>
          </div>
        </div>

        {formData.physicianNotes && (
          <div className="bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-500">Notes</p>
            <p className="text-sm text-gray-700">{formData.physicianNotes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("facility")}
          variant="outline"
          className="flex items-center gap-2 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Referral
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-5 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-blue-600">
              Create Referral
            </h1>
            <div className="w-8 sm:w-16"></div>
          </div>
        </div>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-6 text-center shadow-xl max-w-sm w-full"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-800 font-medium">{success}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <Card className="bg-white shadow-xl border-0">
          <div className="p-4 sm:p-6">
            {renderStepIndicator()}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {currentStep === "patient" && renderPatientStep()}
                {currentStep === "medical" && renderMedicalStep()}
                {currentStep === "facility" && renderFacilityStep()}
                {currentStep === "review" && renderReviewStep()}
              </AnimatePresence>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
