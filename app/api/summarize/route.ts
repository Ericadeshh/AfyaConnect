import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq with environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "API key configuration error" },
        { status: 500 },
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a medical summarization assistant. Create a concise, professional summary of the following medical text. Focus on key symptoms, diagnoses, treatments, and recommendations. Keep it under 200 words.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("API summarization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to summarize" },
      { status: 500 },
    );
  }
}

// Optional: Add a GET handler for testing
export async function GET() {
  return NextResponse.json({
    message:
      'Summarization API endpoint. Use POST request with JSON body: { "text": "your text here" }',
  });
}
