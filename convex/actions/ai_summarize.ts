"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";
import OpenAI from "openai";
import { z } from "zod";
import * as cheerio from "cheerio";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";

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
    const parsed = z
      .object({
        inputType: z.enum(["text", "file", "url", "image"]),
        text: z.string().optional(),
        file: z.any().optional(),
        fileName: z.string().optional(),
        url: z.string().url().optional(),
      })
      .safeParse(args);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        details: parsed.error.format(),
      };
    }

    const { inputType, text, file, fileName, url } = args;
    let content = "";
    let visionSummary: string | undefined;

    try {
      switch (inputType) {
        case "text":
          if (!text?.trim()) throw new Error("Text content required");
          content = text.trim();
          break;

        case "file":
          if (!file || !fileName) throw new Error("File and filename required");

          const fileType = fileName.split(".").pop()?.toLowerCase() ?? "";

          if (fileType === "txt" || fileType === "") {
            content = new TextDecoder().decode(file);
          } else if (["doc", "docx"].includes(fileType)) {
            const result = await mammoth.extractRawText({
              buffer: Buffer.from(file),
            });
            content = result.value?.trim() ?? "";
            if (content.length < 20)
              content = "No readable text in Word document.";
          } else {
            throw new Error(
              `Unsupported file type: .${fileType}. Only TXT, DOC, DOCX supported for direct upload.`,
            );
          }
          break;

        case "url":
          if (!url) throw new Error("URL required");
          const res = await fetch(url);
          if (!res.ok)
            throw new Error(`Failed to fetch URL: ${res.statusText}`);
          const html = await res.text();
          const $ = cheerio.load(html);
          content = $("body").text().replace(/\s+/g, " ").trim();
          if (content.length < 50)
            content = "Insufficient readable content from webpage";
          break;

        case "image":
          if (!file) throw new Error("Image file required");

          if (process.env.OPENAI_API_KEY) {
            try {
              const base64Image = Buffer.from(file).toString("base64");
              const visionRes = await new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
              }).chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Analyze this medical image (X-ray, CT, MRI, ultrasound, skin lesion, etc.). Provide concise bullet-point summary of key findings, abnormalities, possible interpretations, and red flags. Be factual and conservative.",
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
              console.warn("Vision failed:", visionErr);
            }
          }

          try {
            const {
              data: { text: ocrText },
            } = await Tesseract.recognize(Buffer.from(file), "eng", {
              logger: (m) => console.log(m),
            });
            content = ocrText.trim() || "No readable text in image";
          } catch (ocrErr) {
            return {
              success: false,
              error: "Image OCR failed",
              details: String(ocrErr),
            };
          }
          break;

        default:
          throw new Error(`Unsupported input type: ${inputType}`);
      }

      if (!content.trim()) {
        return { success: false, error: "No usable content extracted" };
      }

      const groqRes = await new Groq({
        apiKey: process.env.GROQ_API_KEY,
      }).chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional medical report summarizer for hospital referrals in Kenya. " +
              "Summarize as concise bullet points for the receiving physician. " +
              "Preserve: patient name/age, chief complaint, vitals, diagnosis, medications, " +
              "pending tests, plans, red flags, negations. Be factual, concise, professional.",
          },
          { role: "user", content },
        ],
        max_tokens: 400,
        temperature: 0.2,
      });

      const summaryText =
        groqRes.choices[0]?.message?.content?.trim() || "No summary generated.";

      return {
        success: true,
        summary: summaryText,
        method: inputType === "image" && visionSummary ? "vision" : "text",
      };
    } catch (err: any) {
      console.error("Summarization failed:", err);
      return {
        success: false,
        error: err.message || "Failed to generate summary",
      };
    }
  },
});
