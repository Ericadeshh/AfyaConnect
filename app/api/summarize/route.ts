import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: text }],
      model: "mixtral-8x7b-32768", // or your preferred model
    });
    return NextResponse.json({
      summary: completion.choices[0]?.message?.content,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
