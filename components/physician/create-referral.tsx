"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Activity,
  AlertCircle,
  HeartPulse,
  Building2,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Pill,
  Thermometer,
  Mail,
  UserCircle,
  Users,
  Clock,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";

// Enhanced dummy data for dropdowns
const hospitals = [
  {
    id: "1",
    name: "Nairobi General Hospital",
    location: "Nairobi",
    beds: 500,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Aga Khan University Hospital",
    location: "Nairobi",
    beds: 350,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Kenyatta National Hospital",
    location: "Nairobi",
    beds: 1800,
    rating: 4.3,
  },
  {
    id: "4",
    name: "M.P. Shah Hospital",
    location: "Nairobi",
    beds: 200,
    rating: 4.4,
  },
  {
    id: "5",
    name: "The Mater Hospital",
    location: "Nairobi",
    beds: 250,
    rating: 4.2,
  },
  {
    id: "6",
    name: "Coptic Hospital",
    location: "Nairobi",
    beds: 150,
    rating: 4.1,
  },
  {
    id: "7",
    name: "Coast General Hospital",
    location: "Mombasa",
    beds: 600,
    rating: 4.0,
  },
  {
    id: "8",
    name: "Moi Teaching & Referral Hospital",
    location: "Eldoret",
    beds: 800,
    rating: 4.2,
  },
  {
    id: "9",
    name: "Kisumu County Hospital",
    location: "Kisumu",
    beds: 300,
    rating: 3.9,
  },
  {
    id: "10",
    name: "Nakuru Level 5 Hospital",
    location: "Nakuru",
    beds: 400,
    rating: 4.0,
  },
];

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Oncology",
  "Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Dermatology",
  "Psychiatry",
  "Ophthalmology",
  "ENT",
  "Dentistry",
  "Physical Therapy",
  "Nutrition & Dietetics",
  "Pharmacy",
  "Laboratory Services",
  "Intensive Care Unit (ICU)",
];

const physicians = [
  {
    id: "1",
    name: "Dr. Mary Wanjiku",
    specialization: "Cardiologist",
    available: true,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Dr. James Omondi",
    specialization: "Neurologist",
    available: true,
    rating: 4.7,
  },
  {
    id: "3",
    name: "Dr. Sarah Kimani",
    specialization: "Pediatrician",
    available: false,
    rating: 4.8,
  },
  {
    id: "4",
    name: "Dr. Peter Mwangi",
    specialization: "Orthopedic Surgeon",
    available: true,
    rating: 4.6,
  },
  {
    id: "5",
    name: "Dr. Elizabeth Akinyi",
    specialization: "Gynecologist",
    available: true,
    rating: 4.9,
  },
  {
    id: "6",
    name: "Dr. David Otieno",
    specialization: "Radiologist",
    available: true,
    rating: 4.4,
  },
  {
    id: "7",
    name: "Dr. Grace Nduta",
    specialization: "Dermatologist",
    available: false,
    rating: 4.5,
  },
  {
    id: "8",
    name: "Dr. Michael Kipchoge",
    specialization: "Cardiothoracic Surgeon",
    available: true,
    rating: 5.0,
  },
];

const commonDiagnoses = [
  "Hypertension",
  "Diabetes Mellitus Type 2",
  "Lower Respiratory Infection",
  "Malaria",
  "Pneumonia",
  "Gastroenteritis",
  "Urinary Tract Infection",
  "Asthma",
  "Coronary Artery Disease",
  "Stroke",
  "Fracture",
  "Appendicitis",
  "COVID-19",
  "Tuberculosis",
  "HIV/AIDS",
  "Anemia",
  "Arthritis",
  "Back Pain",
  "Headache/Migraine",
  "Depression/Anxiety",
];

interface CreateReferralPageProps {
  physician: any;
  onBack: () => void;
  token: string;
}

type FormStep = "patient" | "medical" | "facility" | "review";

export default function CreateReferralPage({
  physician,
  onBack,
  token,
}: CreateReferralPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPhysician, setSelectedPhysician] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [customDiagnosis, setCustomDiagnosis] = useState("");

  const createReferral = useMutation(api.referrals.mutations.createReferral);

  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientContact: "",
    patientEmail: "",
    patientId: "",

    // Medical Information
    diagnosis: "",
    clinicalSummary: "",
    reasonForReferral: "",
    urgency: "routine",
    symptoms: "",
    durationOfSymptoms: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
    },
    allergies: "",
    currentMedications: "",
    pastMedicalHistory: "",

    // Facility Information
    referredToFacility: "",
    referredToDepartment: "",
    referredToPhysician: "",

    // Additional
    physicianNotes: "",
    attachments: [] as string[],
    requiresFollowUp: false,
    followUpNotes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value,
      },
    }));
  };

  const handleHospitalSelect = (hospitalName: string) => {
    setSelectedHospital(hospitalName);
    setFormData((prev) => ({ ...prev, referredToFacility: hospitalName }));
  };

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department);
    setFormData((prev) => ({ ...prev, referredToDepartment: department }));
  };

  const handlePhysicianSelect = (physicianName: string) => {
    setSelectedPhysician(physicianName);
    setFormData((prev) => ({ ...prev, referredToPhysician: physicianName }));
  };

  const handleDiagnosisSelect = (diagnosis: string) => {
    setFormData((prev) => ({ ...prev, diagnosis }));
    setDiagnosisSearch("");
    setCustomDiagnosis("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        setSuccess(
          `Referral created successfully! Reference Number: ${result.referralNumber}`,
        );

        // Reset form after 3 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
          onBack();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create referral");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredPhysicians = physicians.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredDiagnoses = commonDiagnoses.filter((d) =>
    d.toLowerCase().includes(diagnosisSearch.toLowerCase()),
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "urgent":
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const steps = [
    { id: "patient", label: "Patient Info", icon: User },
    { id: "medical", label: "Medical Details", icon: Activity },
    { id: "facility", label: "Facility", icon: Building2 },
    { id: "review", label: "Review", icon: FileText },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                    isActive ? "ring-4 ring-blue-100" : ""
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-blue-500" />
            Patient Name *
          </label>
          <input
            type="text"
            name="patientName"
            required
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Age *
          </label>
          <input
            type="number"
            name="patientAge"
            required
            min="0"
            max="150"
            value={formData.patientAge}
            onChange={handleChange}
            placeholder="Enter age"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Gender *
          </label>
          <select
            name="patientGender"
            required
            value={formData.patientGender}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            Contact Number *
          </label>
          <input
            type="tel"
            name="patientContact"
            required
            value={formData.patientContact}
            onChange={handleChange}
            placeholder="+254 XXX XXX XXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Email Address (Optional)
          </label>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            placeholder="patient@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Patient ID (Optional)
          </label>
          <input
            type="text"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            placeholder="Hospital patient ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("medical")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Next: Medical Details
        </Button>
      </div>
    </motion.div>
  );

  const renderMedicalStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-blue-500" />
          Diagnosis *
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or type diagnosis"
            value={diagnosisSearch}
            onChange={(e) => setDiagnosisSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {diagnosisSearch && filteredDiagnoses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              {filteredDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis}
                  onClick={() => handleDiagnosisSelect(diagnosis)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                >
                  {diagnosis}
                </div>
              ))}
            </motion.div>
          )}
        </div>
        {formData.diagnosis && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-700">
              Selected: {formData.diagnosis}
            </span>
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, diagnosis: "" }))
              }
              className="text-gray-500 hover:text-red-500"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            Blood Pressure (mmHg)
          </label>
          <input
            type="text"
            placeholder="e.g., 120/80"
            value={formData.vitalSigns.bloodPressure}
            onChange={(e) =>
              handleVitalSignChange("bloodPressure", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-blue-500" />
            Heart Rate (bpm)
          </label>
          <input
            type="text"
            placeholder="e.g., 72"
            value={formData.vitalSigns.heartRate}
            onChange={(e) => handleVitalSignChange("heartRate", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            Temperature (°C)
          </label>
          <input
            type="text"
            placeholder="e.g., 37.5"
            value={formData.vitalSigns.temperature}
            onChange={(e) =>
              handleVitalSignChange("temperature", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Respiratory Rate
          </label>
          <input
            type="text"
            placeholder="breaths/min"
            value={formData.vitalSigns.respiratoryRate}
            onChange={(e) =>
              handleVitalSignChange("respiratoryRate", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            O2 Saturation (%)
          </label>
          <input
            type="text"
            placeholder="e.g., 98"
            value={formData.vitalSigns.oxygenSaturation}
            onChange={(e) =>
              handleVitalSignChange("oxygenSaturation", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Duration of Symptoms
          </label>
          <input
            type="text"
            name="durationOfSymptoms"
            placeholder="e.g., 3 days"
            value={formData.durationOfSymptoms}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <Pill className="w-4 h-4 text-blue-500" />
          Symptoms
        </label>
        <textarea
          name="symptoms"
          rows={2}
          value={formData.symptoms}
          onChange={handleChange}
          placeholder="Describe the patient's symptoms"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Clinical Summary *
        </label>
        <textarea
          name="clinicalSummary"
          required
          rows={3}
          value={formData.clinicalSummary}
          onChange={handleChange}
          placeholder="Provide a brief clinical summary"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          Reason for Referral *
        </label>
        <textarea
          name="reasonForReferral"
          required
          rows={3}
          value={formData.reasonForReferral}
          onChange={handleChange}
          placeholder="Explain why this patient needs to be referred"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-500" />
            Current Medications
          </label>
          <textarea
            name="currentMedications"
            rows={2}
            value={formData.currentMedications}
            onChange={handleChange}
            placeholder="List current medications"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Allergies
          </label>
          <textarea
            name="allergies"
            rows={2}
            value={formData.allergies}
            onChange={handleChange}
            placeholder="List any allergies"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Past Medical History
        </label>
        <textarea
          name="pastMedicalHistory"
          rows={2}
          value={formData.pastMedicalHistory}
          onChange={handleChange}
          placeholder="Relevant past medical history"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Urgency Level *
          </span>
          <div className="flex gap-2">
            {["routine", "urgent", "emergency"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, urgency: level }))
                }
                className={`px-4 py-2 rounded-lg capitalize flex items-center gap-2 transition-all duration-200 ${
                  formData.urgency === level
                    ? getUrgencyColor(level)
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {getUrgencyIcon(level)}
                {level}
              </button>
            ))}
          </div>
        </div>

        {formData.urgency === "emergency" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency referrals will be flagged for immediate attention.
              Please ensure all critical information is provided.
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("patient")}
          variant="outline"
          className="px-8 py-3 rounded-xl font-medium"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep("facility")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Next: Facility Details
        </Button>
      </div>
    </motion.div>
  );

  const renderFacilityStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Search Facility/Hospital *
          </label>
          <input
            type="text"
            placeholder="Type to search hospitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
          {filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHospitalSelect(hospital.name)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedHospital === hospital.name
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  ⭐ {hospital.rating}
                </span>
              </div>
              <p className="text-sm text-gray-600">{hospital.location}</p>
              <p className="text-sm text-gray-500 mt-2">{hospital.beds} beds</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            Or Enter Custom Facility
          </label>
          <input
            type="text"
            name="referredToFacility"
            value={formData.referredToFacility}
            onChange={handleChange}
            placeholder="Type facility name if not in list"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-500" />
          Department (Optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => handleDepartmentSelect(dept)}
              className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                selectedDepartment === dept
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Specific Physician (Optional)
        </label>
        <input
          type="text"
          placeholder="Search physicians..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mb-2"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
          {filteredPhysicians.map((physician) => (
            <motion.div
              key={physician.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handlePhysicianSelect(physician.name)}
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedPhysician === physician.name
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{physician.name}</p>
                  <p className="text-sm text-gray-600">
                    {physician.specialization}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      physician.available ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-yellow-600">
                    ⭐ {physician.rating}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Additional Notes (Optional)
        </label>
        <textarea
          name="physicianNotes"
          rows={3}
          value={formData.physicianNotes}
          onChange={handleChange}
          placeholder="Any additional information for the receiving facility"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requiresFollowUp"
          checked={formData.requiresFollowUp}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              requiresFollowUp: e.target.checked,
            }))
          }
          className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
        />
        <label htmlFor="requiresFollowUp" className="text-sm text-gray-700">
          Requires follow-up appointment
        </label>
      </div>

      {formData.requiresFollowUp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700">
            Follow-up Notes
          </label>
          <textarea
            name="followUpNotes"
            rows={2}
            value={formData.followUpNotes}
            onChange={handleChange}
            placeholder="Specify follow-up requirements"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("medical")}
          variant="outline"
          className="px-8 py-3 rounded-xl font-medium"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep("review")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Next: Review
        </Button>
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Review Referral Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Patient Information
            </h4>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                {formData.patientName || "—"}
              </p>
              <p>
                <span className="text-gray-500">Age:</span>{" "}
                {formData.patientAge || "—"}
              </p>
              <p>
                <span className="text-gray-500">Gender:</span>{" "}
                {formData.patientGender || "—"}
              </p>
              <p>
                <span className="text-gray-500">Contact:</span>{" "}
                {formData.patientContact || "—"}
              </p>
              {formData.patientEmail && (
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {formData.patientEmail}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Referral Details
            </h4>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <p>
                <span className="text-gray-500">Diagnosis:</span>{" "}
                {formData.diagnosis || "—"}
              </p>
              <p>
                <span className="text-gray-500">Urgency:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(formData.urgency)}`}
                >
                  {formData.urgency}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Reason:</span>{" "}
                {formData.reasonForReferral || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Receiving Facility
            </h4>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <p>
                <span className="text-gray-500">Facility:</span>{" "}
                {formData.referredToFacility || "—"}
              </p>
              {formData.referredToDepartment && (
                <p>
                  <span className="text-gray-500">Department:</span>{" "}
                  {formData.referredToDepartment}
                </p>
              )}
              {formData.referredToPhysician && (
                <p>
                  <span className="text-gray-500">Physician:</span>{" "}
                  {formData.referredToPhysician}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              Physician Information
            </h4>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <p>
                <span className="text-gray-500">Name:</span> Dr.{" "}
                {physician?.fullName}
              </p>
              <p>
                <span className="text-gray-500">Hospital:</span>{" "}
                {physician?.hospital}
              </p>
              <p>
                <span className="text-gray-500">Specialization:</span>{" "}
                {physician?.specialization}
              </p>
            </div>
          </div>
        </div>

        {formData.physicianNotes && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Additional Notes</h4>
            <p className="text-gray-600">{formData.physicianNotes}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>
              Please review all information carefully before submitting. Once
              submitted, the referral will be sent to administration for
              approval.
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep("facility")}
          variant="outline"
          className="px-8 py-3 rounded-xl font-medium"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Referral
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with glass morphism */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create New Referral
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the patient and referral details below
              </p>
            </div>
            <div className="w-24"></div>
          </div>
        </div>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 mb-4">{success}</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
          <div className="p-8">
            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === "patient" && renderPatientStep()}
                {currentStep === "medical" && renderMedicalStep()}
                {currentStep === "facility" && renderFacilityStep()}
                {currentStep === "review" && renderReviewStep()}
              </AnimatePresence>
            </form>
          </div>
        </Card>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Quick Tips
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Fields marked with * are required</li>
            <li>Emergency referrals are flagged for immediate attention</li>
            <li>
              You can search and select from available hospitals and physicians
            </li>
            <li>Review all information before final submission</li>
          </ul>
        </div>
      </div>

      {/* Add required CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
