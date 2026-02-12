import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.7 }}
        className="mt-12"
      >
        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-linear-to-r from-slate-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl">
              {activeTab === "image"
                ? "Image Analysis"
                : "AI-Generated Summary"}
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-teal-50 text-teal-700 border-teal-200"
            >
              Confidence: {confidence}%
            </Badge>
          </CardHeader>

          <CardContent className="pt-6 prose prose-slate max-w-none leading-relaxed">
            {summary.split("\n").map((line, i) => (
              <p key={i} className="mb-3 text-slate-800">
                {line}
              </p>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
