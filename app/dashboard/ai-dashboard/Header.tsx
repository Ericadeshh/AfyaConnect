import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 tracking-tight">
        UzimaCare AI Summarizer
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
        Transform patient notes, documents, URLs, or medical images into concise
        summaries — powered by US AI technology.
      </p>
    </motion.div>
  );
}
