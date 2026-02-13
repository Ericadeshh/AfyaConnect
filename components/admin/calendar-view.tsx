"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { token } = useAuth();

  // Fetch referrals (you can add a query for calendar view)
  const referrals = useQuery(api.referrals.queries.getAllReferrals, {
    token: token || "",
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Group referrals by date
  const referralsByDate = referrals?.reduce((acc: any, referral) => {
    const date = format(new Date(referral.submittedAt), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(referral);
    return acc;
  }, {});

  const getReferralsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return referralsByDate?.[dateStr] || [];
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-500";
      case "urgent":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          Referral Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={prevMonth} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium px-4">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button onClick={nextMonth} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dayReferrals = getReferralsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <motion.button
                    key={day.toString()}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-3 rounded-lg transition-all duration-200
                      ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                      ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}
                      border border-gray-200
                    `}
                  >
                    <div className="text-right mb-2">
                      <span
                        className={`text-sm ${isCurrentMonth ? "text-gray-700" : "text-gray-400"}`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    {dayReferrals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dayReferrals.slice(0, 3).map((ref: any) => (
                          <div
                            key={ref._id}
                            className={`w-2 h-2 rounded-full ${getUrgencyColor(ref.urgency)}`}
                            title={`${ref.patientName} - ${ref.urgency}`}
                          />
                        ))}
                        {dayReferrals.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{dayReferrals.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a date"}
            </h3>

            {selectedDate && (
              <div className="space-y-4">
                {getReferralsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No referrals on this day</p>
                  </div>
                ) : (
                  getReferralsForDate(selectedDate).map((referral: any) => (
                    <motion.div
                      key={referral._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {referral.patientName}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(referral.urgency)} text-white`}
                        >
                          {referral.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Dr. {referral.referringPhysicianName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {referral.referredToFacility}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            referral.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : referral.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {referral.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-gray-700">
            Urgency Levels:
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Routine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Emergency</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
