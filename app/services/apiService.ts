import { LM_STUDIO_MODEL, LM_STUDIO_URL } from "../constants/config";

function stripMarkdownFences(text: string): string {
  return text.replace(/```json|```/gi, "").trim();
}

function extractFirstJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

function extractLmStudioText(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;

  const candidateKeys = ["response", "output", "content", "text"] as const;
  for (const key of candidateKeys) {
    if (key in data) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string") return value;
    }
  }

  return null;
}

async function callLmStudio(systemPrompt: string, input: string): Promise<string> {
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        system_prompt: systemPrompt,
        input,
      }),
    });

    const rawText = await response.text();
    let data: unknown = null;
    try {
      data = rawText ? (JSON.parse(rawText) as unknown) : null;
    } catch {
      data = rawText;
    }

    console.log("LM Studio data:", JSON.stringify(data));

    if (!response.ok) {
      console.error("LM Studio error payload:", JSON.stringify(data));
      throw new Error("Request failed");
    }

    const extracted = extractLmStudioText(data);
    if (typeof extracted === "string") return extracted;

    console.error("LM Studio unknown response shape:", JSON.stringify(data));
    throw new Error("Unexpected response");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}

export async function generateQuestions(problem: string, category: string = "General"): Promise<string[]> {
  try {
    const systemPrompt =
      'You are a personal finance assistant for Filipinos.\n' +
      "Generate exactly 4 short specific follow-up questions to better understand the user's financial concern.\n" +
      "Consider Philippine context: GCash, Maya, SSS, Pag-IBIG, PhilHealth, peso amounts, local banks (BDO, BPI, UnionBank), local investments (GInvest, MP2, UITF, COL Financial).\n" +
      "Respond ONLY with a JSON array of exactly 4 strings.\n" +
      "No markdown. No explanation. No extra text.\n" +
      'Example: ["What is your monthly income in pesos?", "Do you have existing loans?"]';

    const rawResponse = await callLmStudio(
      systemPrompt,
      `Financial category: ${category}. User concern: ${problem}`,
    );

    console.log("LM Studio raw:", rawResponse);

    const cleaned = stripMarkdownFences(rawResponse);
    const jsonText = extractFirstJsonArray(cleaned);
    const parsed = JSON.parse(jsonText) as unknown;

    if (!Array.isArray(parsed)) throw new Error("Invalid questions payload");
    const questions = parsed.map((q) => String(q));
    if (questions.length !== 4) throw new Error("Expected 4 questions");
    return questions;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}

export async function generateDiagnosis(
  problem: string,
  categoryOrQuestions: string | string[],
  questionsOrAnswers: string[] | Record<number, string>,
  maybeAnswers?: Record<number, string>,
): Promise<string> {
  try {
    const category = typeof categoryOrQuestions === "string" ? categoryOrQuestions : "General";
    const questions = Array.isArray(categoryOrQuestions) ? categoryOrQuestions : (questionsOrAnswers as string[]);
    const answers = (Array.isArray(categoryOrQuestions) ? questionsOrAnswers : maybeAnswers) as
      | Record<number, string>
      | undefined;

    const systemPrompt =
      "You are a personal finance assistant for Filipinos.\n" +
      "Provide clear, practical, personalized financial advice based on the user's concern and their answers.\n" +
      "Always use Philippine context: reference peso amounts (\u20b1), local banks (BDO, BPI, UnionBank, Metrobank), e-wallets (GCash, Maya), government benefits (SSS, Pag-IBIG, PhilHealth, BIR), and local investment options (GInvest, MP2, UITF, COL Financial, PSE).\n" +
      "Be concise, friendly, and actionable.\n" +
      "Format your response in clear sections with line breaks.";

    const answersText = questions
      .map((q, i) => {
        const answer = answers?.[i] ?? "No answer provided";
        return `Q: ${q}\nA: ${answer || "No answer provided"}`;
      })
      .join("\n\n");

    const input = `Category: ${category}\nConcern: ${problem}\n\n${answersText}`;

    const rawResponse = await callLmStudio(systemPrompt, input);
    console.log("LM Studio raw:", rawResponse);
    return rawResponse.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}
