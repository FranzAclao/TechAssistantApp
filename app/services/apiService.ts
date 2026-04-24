import { API_KEY, API_URL } from "../constants/config";

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function extractErrorMessage(data: unknown): string | null {
  if (data && typeof data === "object") {
    if ("detail" in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === "string" && detail.trim().length > 0) return detail;
    }
    if ("error" in data) {
      const error = (data as { error?: unknown }).error;
      if (typeof error === "string" && error.trim().length > 0) return error;
    }
  }
  if (typeof data === "string" && data.trim().length > 0) return data;
  return null;
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  try {
    const response = await fetch(joinUrl(API_URL, path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    let data: unknown = null;
    try {
      data = rawText ? (JSON.parse(rawText) as unknown) : null;
    } catch {
      data = rawText;
    }

    console.log("API Response:", JSON.stringify(data));

    if (!response.ok) {
      const message = extractErrorMessage(data) ?? "Request failed";
      throw new Error(message);
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);

    if (error instanceof Error) throw error;
    throw new Error("Something went wrong. Please try again.");
  }
}

export async function generateQuestions(problem: string): Promise<string[]> {
  const data = await postJson("/api/questions", { problem });

  let rawQuestions: unknown = data;

  if (!Array.isArray(rawQuestions) && rawQuestions && typeof rawQuestions === "object" && "questions" in rawQuestions) {
    rawQuestions = (rawQuestions as { questions?: unknown }).questions;
  }

  if (!Array.isArray(rawQuestions)) {
    throw new Error("Something went wrong. Please try again.");
  }

  const questions = rawQuestions.map((q) => String(q));
  if (questions.length !== 4) {
    throw new Error("Something went wrong. Please try again.");
  }

  return questions;
}

export async function generateDiagnosis(
  problem: string,
  questions: string[],
  answers: Record<number, string>,
): Promise<string> {
  const data = await postJson("/api/diagnosis", { problem, questions, answers });

  if (typeof data === "string") return data;

  if (data && typeof data === "object" && "diagnosis" in data) {
    const diagnosis = (data as { diagnosis?: unknown }).diagnosis;
    if (typeof diagnosis === "string") return diagnosis;
  }

  throw new Error("Something went wrong. Please try again.");
}
