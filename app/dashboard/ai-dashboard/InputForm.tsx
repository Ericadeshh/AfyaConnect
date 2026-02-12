import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, Link2, ImageIcon } from "lucide-react";

interface InputFormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
}

export default function InputForm({
  activeTab,
  setActiveTab,
  inputText,
  setInputText,
  file,
  setFile,
  url,
  setUrl,
  loading,
}: InputFormProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
      <TabsList className="grid w-full grid-cols-4 bg-slate-100 overflow-x-auto">
        <TabsTrigger value="text">Text</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="image">Image</TabsTrigger>
      </TabsList>

      <TabsContent value="text">
        <Textarea
          placeholder="Paste handover notes, clinical summary, or referral details..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={10}
          className="resize-none text-base"
          disabled={loading}
        />
      </TabsContent>

      <TabsContent value="upload" className="text-center">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 hover:border-blue-400 transition-colors">
          <Upload
            className="mx-auto h-16 w-16 text-slate-400 mb-6"
            strokeWidth={1.5}
          />
          <p className="text-xl font-medium mb-2">Drop PDF, DOCX, TXT here</p>
          <Input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="max-w-md mx-auto cursor-pointer"
            disabled={loading}
          />
          {file && (
            <p className="mt-4 text-sm font-medium text-blue-700">
              {file.name}
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="url">
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
          <Link2 className="h-6 w-6 text-slate-500 shrink-0" />
          <Input
            type="url"
            placeholder="https://example.com/patient-report.pdf"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
        </div>
      </TabsContent>

      <TabsContent value="image" className="text-center">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 hover:border-purple-400 transition-colors">
          <ImageIcon
            className="mx-auto h-16 w-16 text-slate-400 mb-6"
            strokeWidth={1.5}
          />
          <p className="text-xl font-medium mb-2">Upload Medical Image</p>
          <p className="text-sm text-slate-500 mb-4">
            X-ray, CT, MRI, ultrasound, skin photo (JPG/PNG)
          </p>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="max-w-md mx-auto cursor-pointer"
            disabled={loading}
          />
          {file && (
            <p className="mt-4 text-sm font-medium text-purple-700">
              {file.name}
            </p>
          )}
          <p className="mt-6 text-xs text-slate-500 italic">
            AI will analyze visual findings (powered by OpenAI GPT-4o vision)
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
