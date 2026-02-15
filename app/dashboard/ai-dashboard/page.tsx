"use client";

import { useState } from "react";
import Header from "@/app/dashboard/ai-dashboard/Header";
import Stats from "@/app/dashboard/ai-dashboard/Stats";
import Explanation from "@/app/dashboard/ai-dashboard/Explanation";
import InputForm from "@/app/dashboard/ai-dashboard/InputForm";
import SummaryOutput from "@/app/dashboard/ai-dashboard/SummaryOutput";
import ActionButtons from "@/app/dashboard/ai-dashboard/ActionButtons";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AIDashboard() {
  // @ts-ignore - deep type instantiation workaround
  const saveSummary = useMutation(api.functions.ai_summaries.create);
  // @ts-ignore - deep type instantiation workaround
  const summarizeAction = useAction(api.actions.ai_summarize.summarize);

  const [activeTab, setActiveTab] = useState("text");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    if (activeTab === "text" && !inputText.trim()) return;
    if ((activeTab === "upload" || activeTab === "image") && !file) return;
    if (activeTab === "url" && !url.trim()) return;

    const startTime = Date.now();

    setLoading(true);
    setError("");
    setSummary("");
    setSaved(false);

    try {
      let args: any = {
        inputType: activeTab === "upload" ? "file" : activeTab,
        text: activeTab === "text" ? inputText.trim() : undefined,
        url: activeTab === "url" ? url.trim() : undefined,
      };

      // Client-side PDF text extraction using pdf.js
      if (activeTab === "upload" && file) {
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (ext === "pdf") {
          try {
            const arrayBuffer = await file.arrayBuffer();

            const pdfjsLib = await import("pdfjs-dist");

            // Use local worker file (copied to public/)
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

            const pdf = await pdfjsLib.getDocument({
              data: new Uint8Array(arrayBuffer),
            }).promise;
            let extractedText = "";

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const content = await page.getTextContent();
              const pageText = content.items
                .map((item: any) => item.str)
                .join(" ");
              extractedText += pageText + "\n";
            }

            extractedText = extractedText.trim();

            if (!extractedText) {
              throw new Error(
                "No text could be extracted from this PDF. It may be scanned/image-based.",
              );
            }

            args = {
              inputType: "text",
              text: extractedText,
            };
          } catch (pdfErr: any) {
            setError(
              `Failed to extract PDF text: ${pdfErr.message || "unknown error"}`,
            );
            setLoading(false);
            return;
          }
        } else {
          // DOCX / TXT → send to server
          args.file = await file.arrayBuffer();
          args.fileName = file.name;
        }
      }

      const result = await summarizeAction(args);

      if (!result.success) {
        throw new Error(result.error || "Summarization failed");
      }

      const generatedSummary = result.summary;
      setSummary(generatedSummary);

      const inputPreview =
        activeTab === "text"
          ? inputText.trim().slice(0, 100) +
            (inputText.length > 100 ? "..." : "")
          : file?.name || url.slice(0, 100) || "Untitled";

      const processingTimeMs = Date.now() - startTime;

      await saveSummary({
        inputType: args.inputType,
        inputPreview,
        summary: generatedSummary,
        confidence: result.method === "vision" ? 92 : 88,
        modelUsed:
          result.method === "vision" ? "openai-gpt-4o" : "groq-llama-3.3-70b",
        processingTimeMs,
      });

      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to process summary. Try again.");
      console.error("Summarization error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl pt-10">
        <Header />
        <Stats />
        <Explanation confidence={88} />
        <Card className="border-none shadow-2xl">
          <CardHeader className="bg-slate-50">
            <CardTitle className="text-2xl">
              Generate Clinical Summary
            </CardTitle>
            <CardDescription>
              Input patient data in any format — text, file, URL, or medical
              image.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <InputForm
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              inputText={inputText}
              setInputText={setInputText}
              file={file}
              setFile={setFile}
              url={url}
              setUrl={setUrl}
              loading={loading}
            />

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                size="lg"
                className="min-w-45 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate Summary
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {summary && (
          <>
            <SummaryOutput
              summary={summary}
              activeTab={activeTab}
              confidence={88}
            />
            <ActionButtons summary={summary} />
          </>
        )}
      </div>
    </div>
  );
}
