import { GoogleGenAI } from "@google/genai";

export function getApiKey() {
  const apiKey = useRuntimeConfig().googleGenerativeAiApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Missing NUXT_GOOGLE_GENERATIVE_AI_API_KEY in environment.",
    });
  }

  return apiKey;
}

export function getGeminiClient() {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

export async function createFileSearchStore(
  params: { displayName?: string } = {},
) {
  const displayName =
    params.displayName?.trim() || `Nameless Store ${Date.now()}`;
  const ai = getGeminiClient();
  const store = await ai.fileSearchStores.create({
    config: {
      displayName,
    },
  });
  return store;
}
