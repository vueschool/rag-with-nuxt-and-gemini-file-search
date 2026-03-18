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

export async function uploadDocumentToStore(params: {
  fileSearchStoreName: string;
  content: string;
  displayName: string;
}) {
  const ai = getGeminiClient();
  const markdownBlob = new Blob([params.content], { type: "text/markdown" });
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: markdownBlob,
    fileSearchStoreName: params.fileSearchStoreName,
    config: {
      displayName: params.displayName,
      mimeType: "text/markdown",
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    operation = await ai.operations.get({ operation });
  }

  return;
}
