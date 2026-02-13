"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap, Target } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export default function Stats() {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0); // Use UTC for consistency with stored ISO strings
  const todayTimestamp = todayStart.getTime();

  const summariesToday = useQuery(api.functions.ai_summaries.countToday, {
    today: todayTimestamp,
  });

  const avgProcessingTime = useQuery(api.functions.ai_summaries.avgProcessingTimeToday, {
    today: todayTimestamp,
  });

  const avgConfidence = useQuery(api.functions.ai_summaries.avgConfidenceToday, {
    today: todayTimestamp,
  });

  // Track if we've ever received real data (prevents flicker on reconnect)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (summariesToday !== undefined) {
      setHasLoadedOnce(true);
    }
  }, [summariesToday]);

  // isLoading = true only on initial fetch or when args change
  const isInitialLoading = summariesToday === undefined;

  // Display logic: show "…" only during first load
  // After load → use real values or defaults (0 / —)
  const displayCount = isInitialLoading ? "…" : (summariesToday ?? 0);

  const displayTime =
    isInitialLoading
      ? "…"
      : avgProcessingTime != null
        ? `${avgProcessingTime.toFixed(1)}s`
        : "—";

  const displayConf =
    isInitialLoading
      ? "…"
      : avgConfidence != null
        ? `${Math.round(avgConfidence)}%`
        : "—";

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
                {isInitialLoading ? (
                  <span className="animate-pulse">…</span>
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}