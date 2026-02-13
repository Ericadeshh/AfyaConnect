import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  User,
  HeartPulse,
  Stethoscope,
  Pill,
  TestTube,
  ClipboardList,
  AlertTriangle,
  Ban,
  FileText,
} from "lucide-react";

interface SummaryOutputProps {
  summary: string;
  activeTab: string;
  confidence: number;
}

export default function SummaryOutput({
  summary,
  activeTab,
  confidence,
}: SummaryOutputProps) {
  // Split summary into lines and detect common bullet patterns
  const lines = summary.split("\n").filter(Boolean);

  // Map common keywords to icons for visual enhancement
  const getIconForLine = (line: string) => {
    const lower = line.toLowerCase();
    if (
      lower.includes("patient") ||
      lower.includes("name") ||
      lower.includes("age")
    )
      return <User className="h-5 w-5 text-blue-600" />;
    if (lower.includes("complaint") || lower.includes("chief"))
      return <FileText className="h-5 w-5 text-amber-600" />;
    if (
      lower.includes("vital") ||
      lower.includes("bp") ||
      lower.includes("pulse")
    )
      return <HeartPulse className="h-5 w-5 text-red-600" />;
    if (lower.includes("diagnosis") || lower.includes("working"))
      return <Stethoscope className="h-5 w-5 text-green-600" />;
    if (lower.includes("medication") || lower.includes("meds"))
      return <Pill className="h-5 w-5 text-purple-600" />;
    if (
      lower.includes("test") ||
      lower.includes("pending") ||
      lower.includes("investigation")
    )
      return <TestTube className="h-5 w-5 text-cyan-600" />;
    if (lower.includes("plan") || lower.includes("management"))
      return <ClipboardList className="h-5 w-5 text-indigo-600" />;
    if (lower.includes("red flag") || lower.includes("urgent"))
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    if (
      lower.includes("negation") ||
      lower.includes("no") ||
      lower.includes("negative")
    )
      return <Ban className="h-5 w-5 text-gray-600" />;
    return <CheckCircle2 className="h-5 w-5 text-teal-600" />; // default
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.7 }}
        className="mt-12"
      >
        <Card className="border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-semibold text-slate-800">
              {activeTab === "image"
                ? "Image Analysis"
                : "AI-Generated Summary"}
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-teal-50 text-teal-700 border-teal-200 px-4 py-1 text-sm font-medium"
            >
              Confidence: {confidence}%
            </Badge>
          </CardHeader>

          <CardContent className="pt-8 pb-10 px-6 md:px-10">
            <div className="space-y-5 text-slate-800 leading-relaxed">
              {lines.map((line, i) => {
                const isBullet =
                  line.trim().startsWith("-") || line.trim().startsWith("*");
                const cleanLine = isBullet
                  ? line.trim().slice(1).trim()
                  : line.trim();

                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      {isBullet ? (
                        getIconForLine(cleanLine)
                      ) : (
                        <FileText className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <p className="text-base">
                      {cleanLine.split(/(\*\*.*?\*\*)/).map((part, idx) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong
                            key={idx}
                            className="font-semibold text-slate-900"
                          >
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
