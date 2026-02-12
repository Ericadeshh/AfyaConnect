import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Printer,
  MessageCircle,
  Share2,
  Mail,
} from "lucide-react";

interface ActionButtonsProps {
  summary: string;
}

export default function ActionButtons({ summary }: ActionButtonsProps) {
  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    alert("Copied to clipboard!");
  };

  const downloadTxt = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uzimacare-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  const printSummary = () => {
    if (!summary) return;
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(
        "<html><head><title>UzimaCare Summary</title></head><body>",
      );
      printWindow.document.write(
        "<h1 style='text-align:center'>UzimaCare AI Summary</h1>",
      );
      printWindow.document.write(
        "<pre style='font-family:Arial; white-space:pre-wrap;'>" +
          summary +
          "</pre>",
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const shareWhatsApp = () => {
    if (!summary) return;
    const text = encodeURIComponent(`UzimaCare AI Summary:\n\n${summary}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    if (!summary) return;
    const subject = encodeURIComponent("UzimaCare AI Medical Summary");
    const body = encodeURIComponent(summary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="px-6 pb-6 flex flex-wrap gap-3 justify-end border-t pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={downloadTxt}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        TXT
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={printSummary}
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>

      <div className="relative group">
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        <div className="absolute right-0 mt-2 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-35 z-10">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100 rounded"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={shareEmail}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-100 rounded"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
