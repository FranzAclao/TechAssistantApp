import { LM_STUDIO_MODEL, LM_STUDIO_TOKEN, LM_STUDIO_URL } from "../constants/config";

const logRequest = (functionName: string, url: string, payload: object) => {
  console.log("=".repeat(60));
  console.log(`🌐 REQUEST — ${functionName}`);
  console.log(`📡 URL: ${url}`);
  console.log(`⏱️  Time: ${new Date().toISOString()}`);
  console.log("📦 Payload:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("=".repeat(60));
};

const logResponse = (functionName: string, status: number, data: object, durationMs: number) => {
  console.log("=".repeat(60));
  console.log(`✅ RESPONSE — ${functionName}`);
  console.log(`📊 Status: ${status}`);
  console.log(`⏱️  Duration: ${durationMs}ms`);
  console.log("📨 Response:");
  console.log(JSON.stringify(data, null, 2));
  console.log("=".repeat(60));
};

const logError = (functionName: string, error: any, durationMs: number) => {
  console.log("=".repeat(60));
  console.log(`❌ ERROR — ${functionName}`);
  console.log(`⏱️  Duration: ${durationMs}ms`);
  console.log(`💥 Message: ${error?.message ?? String(error)}`);
  console.log(`📚 Stack: ${error?.stack ?? ""}`);
  console.log("=".repeat(60));
};

function stripMarkdownFences(text: string): string {
  return text.replace(/```json|```/gi, "").trim();
}

function extractFirstJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

async function callLmStudio(systemPrompt: string, input: string): Promise<unknown> {
  try {
    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LM_STUDIO_TOKEN}`,
      },
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

    return { status: response.status, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}

type LMStudioResponse = {
  output?: {
    type?: string;
    content?: string;
  }[];
};

export async function generateQuestions(problem: string, category: string = "General"): Promise<string[]> {
  const startTime = Date.now();
  try {
    const systemPrompt =
      "You are a friendly personal finance assistant for Filipinos.\n" +
      "Generate exactly 4 follow-up questions to better understand \n" +
      "the user's financial concern.\n\n" +
      "STRICT RULES for questions:\n" +
      "- Always write in clear simple English only — no Tagalog, no Taglish\n" +
      "- Each question must be short, conversational and easy to understand\n" +
      "- Always include a practical example in parentheses so user knows what to answer\n" +
      "- Questions must be specific to the category and concern\n" +
      "- Avoid financial jargon — write like you are texting a friend\n" +
      "- Respond ONLY with a JSON array of exactly 4 strings\n" +
      "- No markdown, no explanation, no extra text\n\n" +
      "Good example questions:\n" +
      "'How much do you earn every month? (e.g. ₱15,000 salary + ₱5,000 freelance)'\n" +
      "'Do you have any existing debts right now? (e.g. credit card, personal loan, 5-6)'\n" +
      "'How much can you set aside for savings each month? (e.g. ₱1,000 or 10% of salary)'\n" +
      "'Do you already have an emergency fund? (e.g. yes — 1 month expenses, or none yet)'\n\n" +
      "YOUR ENTIRE RESPONSE MUST START WITH [ AND END WITH ]. \n" +
      "NOTHING BEFORE [. NOTHING AFTER ]. ONLY THE JSON ARRAY.";

    const input = `Financial category: ${category}. User concern: ${problem}`;
    const payload = {
      model: LM_STUDIO_MODEL,
      system_prompt: systemPrompt,
      input,
    };

    logRequest("generateQuestions", LM_STUDIO_URL, payload);

    const responseData = (await callLmStudio(systemPrompt, input)) as { status: number; data: unknown };
    const durationMs = Date.now() - startTime;
    logResponse("generateQuestions", responseData.status, responseData.data as object, durationMs);

    const data = responseData.data as LMStudioResponse;

    const messageBlock = data?.output?.find((block: any) => block.type === "message");
    const rawText = messageBlock?.content;

    console.log("LM Studio message block:", rawText);

    if (!rawText) {
      console.error("Could not extract content from LM Studio response");
      throw new Error("Unexpected response from LM Studio");
    }

    console.log("LM Studio extracted text:", rawText);

    const match = rawText.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array found in response:", rawText);
      throw new Error("Could not parse questions from response");
    }

    const jsonString = match[0];
    const cleaned = stripMarkdownFences(extractFirstJsonArray(jsonString.replace(/```json|```/g, "").trim()));

    let questions: unknown;
    try {
      questions = JSON.parse(cleaned) as unknown;
    } catch {
      console.error("Could not parse questions from response:", rawText);
      throw new Error("Could not parse questions from response");
    }

    if (!Array.isArray(questions) || questions.length !== 4 || !questions.every((q) => typeof q === "string")) {
      console.error("Invalid questions format:", questions);
      throw new Error("Invalid questions format received");
    }

    return questions;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError("generateQuestions", error, durationMs);
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
  const startTime = Date.now();
  try {
    const category = typeof categoryOrQuestions === "string" ? categoryOrQuestions : "General";
    const questions = Array.isArray(categoryOrQuestions) ? categoryOrQuestions : (questionsOrAnswers as string[]);
    const answers = (Array.isArray(categoryOrQuestions) ? questionsOrAnswers : maybeAnswers) as
      | Record<number, string>
      | undefined;

    const systemPrompt =
      "You are a friendly personal finance assistant for Filipinos.\n" +
      "Provide clear, practical, personalized financial advice based on \n" +
      "the user's concern and their answers.\n\n" +
      "STRICT RULES for your response:\n" +
      "- NO emojis anywhere in your response\n" +
      "- NO markdown headers with # symbols\n" +
      "- Write in plain conversational paragraphs\n" +
      "- Use simple numbered lists only when listing steps (1. 2. 3.)\n" +
      "- Use simple bullet points (-) only when listing options\n" +
      "- Keep sections separated by a blank line\n" +
      "- Always use Philippine context: peso amounts (\u20b1), local banks \n" +
      "  (BDO, BPI, UnionBank, Metrobank), e-wallets (GCash, Maya), \n" +
      "  government benefits (SSS, Pag-IBIG, PhilHealth, BIR), and \n" +
      "  local investment options (GInvest, MP2, UITF, COL Financial, PSE)\n" +
      "- Be concise, warm, and direct — like advice from a financially \n" +
      "  savvy friend\n" +
      "End your response with exactly this line:\n" +
      "'Do you have any follow-up questions about this advice?'";

    const answersText = questions
      .map((q, i) => {
        const answer = answers?.[i] ?? "No answer provided";
        return `Q: ${q}\nA: ${answer || "No answer provided"}`;
      })
      .join("\n\n");

    const input = `Category: ${category}\nConcern: ${problem}\n\n${answersText}`;

    const payload = {
      model: LM_STUDIO_MODEL,
      system_prompt: systemPrompt,
      input,
    };

    logRequest("generateDiagnosis", LM_STUDIO_URL, payload);

    const responseData = (await callLmStudio(systemPrompt, input)) as { status: number; data: unknown };
    const durationMs = Date.now() - startTime;
    logResponse("generateDiagnosis", responseData.status, responseData.data as object, durationMs);

    const data = responseData.data as LMStudioResponse;

    const messageBlock = data?.output?.find((block: any) => block.type === "message");
    const rawText = messageBlock?.content;

    console.log("LM Studio message block:", rawText);

    if (!rawText) {
      console.error("Could not extract content from LM Studio response");
      throw new Error("Unexpected response from LM Studio");
    }

    console.log("LM Studio extracted text:", rawText);
    return rawText.trim();
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError("generateDiagnosis", error, durationMs);
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}

export async function generateFollowUp(
  originalConcern: string,
  originalAdvice: string,
  conversationHistory: { role: "user" | "ai"; message: string }[],
  newQuestion: string,
): Promise<string> {
  const startTime = Date.now();
  try {
    const systemPrompt =
      "You are a friendly personal finance assistant for Filipinos.\n" +
      "The user previously received financial advice and is now asking a follow-up question.\n" +
      "Answer based on the context of the original concern and advice given.\n\n" +
      "STRICT RULES:\n" +
      "- NO emojis\n" +
      "- NO markdown headers\n" +
      "- Plain conversational paragraphs only\n" +
      "- Use numbered lists or bullet points (-) only when necessary\n" +
      "- Keep answers concise — 3 to 5 sentences maximum\n" +
      "- Always use Philippine financial context\n" +
      "End with 'Is there anything else you would like to know?'";

    const summaryBase = (originalAdvice ?? "").slice(0, 300);
    const summary = `${summaryBase}${(originalAdvice ?? "").length > 300 ? "..." : ""}`;

    const historyText =
      conversationHistory
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.message}`)
        .join("\n") || "(no previous messages)";

    const input =
      `Original concern: ${originalConcern}\n\n` +
      `Original advice summary: ${summary}\n\n` +
      `Previous conversation:\n` +
      `${historyText}\n\n` +
      `New question: ${newQuestion}`;

    const payload = {
      model: LM_STUDIO_MODEL,
      system_prompt: systemPrompt,
      input,
    };

    logRequest("generateFollowUp", LM_STUDIO_URL, payload);

    const responseData = (await callLmStudio(systemPrompt, input)) as { status: number; data: unknown };
    const durationMs = Date.now() - startTime;
    logResponse("generateFollowUp", responseData.status, responseData.data as object, durationMs);

    const data = responseData.data as LMStudioResponse;

    const messageBlock = data?.output?.find((block: any) => block.type === "message");
    const rawText = messageBlock?.content;

    console.log("LM Studio message block:", rawText);

    if (!rawText) {
      console.error("Could not extract content from LM Studio response");
      throw new Error("Unexpected response from LM Studio");
    }

    console.log("LM Studio extracted text:", rawText);
    return rawText.trim();
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logError("generateFollowUp", error, durationMs);
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    throw new Error("Something went wrong. Please try again.");
  }
}
