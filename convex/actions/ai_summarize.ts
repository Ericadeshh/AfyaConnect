"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";
import OpenAI from "openai";
import { z } from "zod";
import * as cheerio from "cheerio";
import Tesseract from "tesseract.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const InputSchema = z.object({
  inputType: z.enum(["text", "file", "url", "image"]),
  text: z.string().optional(),
  file: z.any().optional(),
  fileName: z.string().optional(),
  url: z.string().url().optional(),
});

export const summarize = action({
  args: {
    inputType: v.union(
      v.literal("text"),
      v.literal("file"),
      v.literal("url"),
      v.literal("image"),
    ),
    text: v.optional(v.string()),
    file: v.optional(v.bytes()),
    fileName: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const parsed = InputSchema.safeParse(args);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        details: parsed.error.format(),
      };
    }

    const { inputType, text, file, fileName, url } = args;
    let content = "";

    try {
      switch (inputType) {
        case "text":
          if (!text) throw new Error("Text content required for text input");
          content = text;
          break;

        case "file":
          if (!file) throw new Error("No file provided");
          if (!fileName) throw new Error("fileName required for file input");

          const fileType = fileName.split(".").pop()?.toLowerCase() ?? "";

          try {
            if (fileType === "txt" || fileType === "") {
              content = new TextDecoder().decode(file);
            } else if (fileType === "pdf") {
              const pdfParse = (await import("pdf-parse")) as unknown as (
                buffer: Buffer,
              ) => Promise<{ text: string }>;

              const pdfData = await pdfParse(Buffer.from(file));
              content = pdfData.text.trim();

              if (content.length < 20) {
                content =
                  "No meaningful text could be extracted from this PDF.";
              }
            } else if (["doc", "docx"].includes(fileType)) {
              const mammoth = (await import("mammoth")).default;
              const result = await mammoth.extractRawText({
                arrayBuffer: file,
              });
              content = result.value.trim();
              if (content.length < 20) {
                content =
                  "No meaningful text could be extracted from this Word document.";
              }
            } else {
              content = `Unsupported file format (.${fileType}). Supported: TXT, PDF, DOC, DOCX`;
            }
          } catch (extractErr: any) {
            console.error("File extraction failed:", extractErr);
            content = `Error extracting text from file: ${
              extractErr.message || "Unknown error"
            }`;
          }
          break;

        case "url":
          if (!url) throw new Error("No URL provided");
          const res = await fetch(url);
          if (!res.ok)
            throw new Error(`Failed to fetch URL: ${res.statusText}`);
          const html = await res.text();
          const $ = cheerio.load(html);
          content = $("body").text().replace(/\s+/g, " ").trim();
          if (content.length < 50) {
            content = "The webpage did not contain enough readable content.";
          }
          break;

        case "image":
          if (!file) throw new Error("No image provided");

          let visionSummary: string | undefined;

          if (process.env.OPENAI_API_KEY) {
            try {
              const base64Image = Buffer.from(file).toString("base64");
              const visionRes = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `Analyze this medical image (X-ray, CT, MRI, ultrasound, skin lesion, etc.). 
Provide a concise bullet-point summary of key visible findings, abnormalities, 
possible clinical interpretations, and any urgent/red-flag features. 
Be factual, professional, conservative. Do NOT make definitive diagnoses.`,
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:image/jpeg;base64,${base64Image}`,
                        },
                      },
                    ],
                  },
                ],
                max_tokens: 500,
                temperature: 0.3,
              });

              visionSummary = visionRes.choices[0]?.message?.content?.trim();
              if (visionSummary) {
                return {
                  success: true,
                  summary: visionSummary,
                  method: "vision",
                };
              }
            } catch (visionErr) {
              console.warn(
                "OpenAI vision failed, falling back to OCR:",
                visionErr,
              );
            }
          }

          try {
            const {
              data: { text: ocrText },
            } = await Tesseract.recognize(Buffer.from(file), "eng", {
              logger: (m) => console.log(m),
            });
            content = ocrText.trim() || "No readable text detected in image.";
          } catch (ocrErr) {
            return {
              success: false,
              error: "Image OCR failed",
              details: String(ocrErr),
            };
          }
          break;
      }

      if (!content.trim()) {
        return {
          success: false,
          error: "No content could be extracted from the input",
        };
      }

      const groqRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional medical report summarizer for hospital referrals in Kenya. " +
              "Summarize the input as concise bullet points for the receiving physician. " +
              "Preserve: patient name/age, chief complaint, vitals, diagnosis, medications, " +
              "pending tests, plans, red flags, negations. Be factual and concise.",
          },
          { role: "user", content },
        ],
        max_tokens: 400,
        temperature: 0.2,
      });

      const summaryText =
        groqRes.choices[0]?.message?.content?.trim() || "No summary generated.";

      return { success: true, summary: summaryText, method: "text" };
    } catch (err) {
      console.error("Summarization action error:", err);
      return {
        success: false,
        error: "Failed to generate summary",
        details: String(err),
      };
    }
  },
});
