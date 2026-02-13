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
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  BedDouble,
  Activity,
  ChevronRight,
  X,
  Save,
  Loader2,
  Eye,
  Power,
  RefreshCw,
} from "lucide-react";

interface Facility {
  _id: Id<"facilities">;
  name: string;
  type: "hospital" | "clinic" | "health_center" | "specialized_clinic";
  registrationNumber: string;
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
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

interface FacilityManagementProps {
  adminUser: any;
  token: string;
}

type ViewMode = "list" | "create" | "edit" | "details";

const facilityTypes = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "health_center", label: "Health Center" },
  { value: "specialized_clinic", label: "Specialized Clinic" },
];

export default function FacilityManagement({
  adminUser,
  token,
}: FacilityManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Queries
  const facilities = useQuery(api.admin.queries.getAllFacilities, {
    adminToken: token,
  });

  // Mutations
  const createFacility = useMutation(
    api.admin.facilityMutations.createFacility,
  );
  const toggleStatus = useMutation(
    api.admin.facilityMutations.toggleFacilityStatus,
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "hospital" as const,
    registrationNumber: "",
    address: "",
    city: "",
    county: "",
    phone: "",
    email: "",
    website: "",
    services: [] as string[],
    departments: [] as string[],
    bedCapacity: "",
    emergencyServices: false,
    operatingHours: "24/7",
    accreditation: "",
  });

  const [newService, setNewService] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const addDepartment = () => {
    if (
      newDepartment.trim() &&
      !formData.departments.includes(newDepartment.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()],
      }));
      setNewDepartment("");
    }
  };

  const removeDepartment = (department: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== department),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "hospital",
      registrationNumber: "",
      address: "",
      city: "",
      county: "",
      phone: "",
      email: "",
      website: "",
      services: [],
      departments: [],
      bedCapacity: "",
      emergencyServices: false,
      operatingHours: "24/7",
      accreditation: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await createFacility({
        adminToken: token,
        adminId: adminUser.id,
        ...formData,
        bedCapacity: formData.bedCapacity
          ? parseInt(formData.bedCapacity)
          : undefined,
      });

      if (result.success) {
        setSuccessMessage("Facility created successfully!");
        resetForm();
        setTimeout(() => {
          setSuccessMessage("");
          setViewMode("list");
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create facility");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (
    facilityId: Id<"facilities">,
    currentStatus: string,
  ) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await toggleStatus({
        adminToken: token,
        adminId: adminUser.id,
        facilityId,
        status: newStatus,
      });
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const filteredFacilities = facilities?.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.county.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return facilityTypes.find((t) => t.value === type)?.label || type;
  };

  // Detail View
  if (viewMode === "details" && selectedFacility) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setViewMode("list");
              setSelectedFacility(null);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Facilities
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Facility Details</h2>
          <div className="w-24"></div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-gray-500">
                    {getTypeLabel(selectedFacility.type)} • Reg:{" "}
                    {selectedFacility.registrationNumber}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${getStatusColor(selectedFacility.status)}`}
              >
                {getStatusIcon(selectedFacility.status)}
                {selectedFacility.status}
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
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>
                      {selectedFacility.address}, {selectedFacility.city},{" "}
                      {selectedFacility.county}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{selectedFacility.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{selectedFacility.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">
                  Facility Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Hours: {selectedFacility.operatingHours}</span>
                  </div>
                  {selectedFacility.bedCapacity && (
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-5 h-5 text-gray-400" />
                      <span>Capacity: {selectedFacility.bedCapacity} beds</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <span>
                      Emergency Services:{" "}
                      {selectedFacility.emergencyServices ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Services</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Departments</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility.departments.map((dept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() =>
                  handleToggleStatus(
                    selectedFacility._id,
                    selectedFacility.status,
                  )
                }
                variant="outline"
                className={
                  selectedFacility.status === "active"
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                <Power className="w-4 h-4 mr-2" />
                {selectedFacility.status === "active"
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Create View
  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setViewMode("list")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Facilities
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Add New Facility</h2>
          <div className="w-24"></div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <XCircle className="w-5 h-5" />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                <CheckCircle className="w-5 h-5" />
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nairobi General Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Type *
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {facilityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HOSP/2025/001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+254 XXX XXX XXX"
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
                  placeholder="info@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County *
                </label>
                <input
                  type="text"
                  name="county"
                  required
                  value={formData.county}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 24/7 or Mon-Fri 8am-8pm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Capacity
                </label>
                <input
                  type="number"
                  name="bedCapacity"
                  value={formData.bedCapacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  Emergency Services Available
                </label>
              </div>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a service (e.g., Emergency Care)"
                />
                <Button type="button" onClick={addService} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.services.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departments
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a department (e.g., Cardiology)"
                />
                <Button type="button" onClick={addDepartment} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.departments.map((dept) => (
                  <span
                    key={dept}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {dept}
                    <button
                      type="button"
                      onClick={() => removeDepartment(dept)}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Facility
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
            <Building2 className="w-6 h-6 text-blue-500" />
            Facilities Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {facilities?.length || 0} facilities • Active:{" "}
            {facilities?.filter((f) => f.status === "active").length || 0}
          </p>
        </div>
        <Button
          onClick={() => setViewMode("create")}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Facility
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search facilities by name, city or county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities?.map((facility) => (
          <motion.div
            key={facility._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
            onClick={() => {
              setSelectedFacility(facility as Facility);
              setViewMode("details");
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {facility.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${getStatusColor(facility.status)}`}
                    >
                      {getStatusIcon(facility.status)}
                      {facility.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="line-clamp-1">
                    {facility.city}, {facility.county}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{facility.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span>{facility.services.length} services</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFacility(facility as Facility);
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
      {filteredFacilities?.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No Facilities Found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by adding your first facility"}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setViewMode("create")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
