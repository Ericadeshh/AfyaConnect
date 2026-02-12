import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function Explanation({
  confidence = 94,
}: {
  confidence?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="mb-12"
    >
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Info className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">
              How UzimaCare Uses This AI Microservice
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Built with US-based technology for compliance, speed, and
            reliability.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Model Confidence Score
              </span>
              <span className="text-sm font-bold text-teal-700">
                {confidence}%
              </span>
            </div>
            <div className="relative h-4 bg-teal-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute h-full bg-linear-to-r from-teal-500 to-teal-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${confidence}%` }}
                transition={{
                  duration: 4,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.6,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
              Validated on clinical handover notes • Higher confidence = more
              reliable summaries
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-3 text-slate-800">
                US Technology Integration
              </h4>
              <p className="text-slate-600 mb-4">
                Powered by <strong>Groq</strong> — a California-based AI
                inference company.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Ultra-fast inference with US-designed hardware</li>
                <li>• Compliant with US data privacy & security standards</li>
                <li>
                  • Meets the project's core requirement for US tech integration
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 text-slate-800 flex items-center gap-2">
                Why We Chose Groq + Llama-3.3-70B
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {expanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </h4>
              <AnimatePresence>
                {expanded && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 text-sm text-slate-600 overflow-hidden"
                  >
                    <li>
                      • <strong>Free tier</strong> — no cost for development &
                      low-volume use
                    </li>
                    <li>• Exceptional quality on medical/clinical text</li>
                    <li>• Extremely fast (~2–3s per summary)</li>
                    <li>• 70B parameters — best accuracy/speed balance</li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
