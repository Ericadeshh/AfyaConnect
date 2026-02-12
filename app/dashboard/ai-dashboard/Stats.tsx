"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap, Target } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Stats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTimestamp = todayStart.getTime();

  const summariesToday = useQuery(api.functions.ai_summaries.countToday, {
    today: todayTimestamp,
  });

  const avgProcessingTime = useQuery(
    api.functions.ai_summaries.avgProcessingTimeToday,
    {
      today: todayTimestamp,
    },
  );

  const avgConfidence = useQuery(
    api.functions.ai_summaries.avgConfidenceToday,
    {
      today: todayTimestamp,
    },
  );

  const displayCount = summariesToday ?? "…";
  const displayTime =
    avgProcessingTime !== undefined && avgProcessingTime !== null
      ? `${avgProcessingTime.toFixed(1)}s`
      : "…";
  const displayConf =
    avgConfidence !== undefined && avgConfidence !== null
      ? `${Math.round(avgConfidence)}%`
      : "…";

  const stats = [
    { title: "Summaries Today", value: displayCount, icon: BarChart3 },
    { title: "Avg. Processing Time", value: displayTime, icon: Zap },
    { title: "Avg. Model Confidence", value: displayConf, icon: Target },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.6 }}
        >
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
