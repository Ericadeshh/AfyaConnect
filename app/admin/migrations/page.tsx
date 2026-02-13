"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  UserPlus,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function MigrationsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const runMigration = useMutation(
    api.migrations.physicianMigrations.createMissingPhysicianProfiles,
  );

  const handleRunMigration = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await runMigration({
        adminToken: token || "",
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to run migration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            Database Migrations
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Run database migrations to sync user data and create missing
            physician profiles
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-4 sm:p-6 md:p-8">
          <div className="space-y-6">
            {/* Warning Box */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Ensure you have at least one active facility before running
                  </li>
                  <li>
                    This operation will create physician profiles for existing
                    users
                  </li>
                  <li>Existing profiles will not be overwritten</li>
                </ul>
              </div>
            </div>

            {/* Migration Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Physician Profile Migration
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create missing physician profiles for existing user accounts
                </p>
              </div>
              <Button
                onClick={handleRunMigration}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Migration...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Run Migration
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">
                        {result.message}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Total: {result.summary.total} | Created:{" "}
                        {result.summary.created} | Existing:{" "}
                        {result.summary.existing} | Failed:{" "}
                        {result.summary.failed}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  {(result.details.created.length > 0 ||
                    result.details.alreadyExisting.length > 0 ||
                    result.details.failed.length > 0) && (
                    <Card className="p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Detailed Results
                      </h3>

                      {result.details.created.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Created ({result.details.created.length})
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {result.details.created.map(
                              (item: any, idx: number) => (
                                <p key={idx} className="text-xs text-gray-600">
                                  • {item.userName} ({item.userEmail}) - Profile
                                  ID: {item.profileId}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {result.details.alreadyExisting.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Already Existing (
                            {result.details.alreadyExisting.length})
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {result.details.alreadyExisting.map(
                              (item: any, idx: number) => (
                                <p key={idx} className="text-xs text-gray-600">
                                  • {item.userName} ({item.userEmail})
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {result.details.failed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Failed ({result.details.failed.length})
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {result.details.failed.map(
                              (item: any, idx: number) => (
                                <p key={idx} className="text-xs text-red-600">
                                  • {item.userName} ({item.userEmail}) -{" "}
                                  {item.error}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Next Steps */}
        {result?.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>
                Go to the{" "}
                <Link
                  href="/dashboard/admin?tab=physicians"
                  className="font-medium underline"
                >
                  Physicians tab
                </Link>{" "}
                in your admin dashboard
              </li>
              <li>Click on "View Physicians" to see all physician profiles</li>
              <li>
                You can now manage physicians from the "Manage Physicians" tab
              </li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}
