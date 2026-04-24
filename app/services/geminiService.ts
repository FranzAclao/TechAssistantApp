const OLLAMA_URL = "http://192.168.100.254:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";
const OLLAMA_HEALTH_URL = OLLAMA_URL.replace(/\/api\/generate$/, "/api/tags");

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

function stripCodeFences(text: string): string {
  return text.replace(/```json|```/gi, "").trim();
}

function extractJsonArray(text: string): string {
  const cleaned = stripCodeFences(text);
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

async function postToOllama(prompt: string): Promise<OllamaGenerateResponse> {
  let response: Response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });
  } catch (e) {
    const original = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Network error contacting Ollama at ${OLLAMA_URL}. ` +
        `Ensure your device can reach this IP/port (try ${OLLAMA_HEALTH_URL} in your phone browser). ` +
        `Original error: ${original}`,
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Ollama request failed (${response.status}). ${errorText}`.trim());
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  if (data.error) throw new Error(data.error);
  return data;
}

export const generateQuestions = async (problem: string): Promise<string[]> => {
  const data = await postToOllama(
    `You are a tech support assistant. A user has the following tech problem: "${problem}".
Generate exactly 4 short, specific follow-up questions to better understand their problem.
Respond ONLY with a JSON array of 4 strings, no markdown, no explanation.
Example: ["What is your operating system?", "When did this start?"]`,
  );
  if (!data.response) throw new Error("Ollama returned an empty response.");

  const cleaned = extractJsonArray(data.response);
  const parsed = JSON.parse(cleaned) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of 4 strings.");

  const questions = parsed
    .map((item) => String(item).trim())
    .filter((q) => q.length > 0);

  if (questions.length !== 4) {
    throw new Error(`Expected 4 questions but got ${questions.length}.`);
  }

  return questions;
};

export const generateDiagnosis = async (
  problem: string,
  questions: string[],
  answers: Record<number, string>,
): Promise<string> => {
  const answersText = questions
    .map((q, i) => `Q: ${q}\nA: ${answers[i] || "No answer provided"}`)
    .join("\n\n");

  const data = await postToOllama(
    `You are a tech support assistant.
The user's problem: "${problem}"

Follow-up Q&A:
${answersText}

Based on this information, provide a clear and helpful diagnosis with step-by-step solutions. Be concise and practical.`,
  );
  if (!data.response) throw new Error("Ollama returned an empty response.");

  return stripCodeFences(data.response);
};
