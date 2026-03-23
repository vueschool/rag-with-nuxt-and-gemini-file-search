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

export async function askStore(params: {
  fileSearchStoreName: string;
  question: string;
}) {
  const ai = getGeminiClient();
  const groundedQuestion = [
    "Answer using only the retrieved File Search context.",
    'If the context does not contain the answer, say: "I do not know based on the uploaded documents."',
    `Question: ${params.question}`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: groundedQuestion,
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [params.fileSearchStoreName],
          },
        },
      ],
    },
  });

  return {
    text: response.text ?? "",
    groundingMetadata: response.candidates?.[0]?.groundingMetadata ?? null,
  };
}

export async function listStoreDocuments(params: {
  fileSearchStoreName: string;
}) {
  const ai = getGeminiClient();
  const result: Array<{
    name: string;
    displayName: string;
  }> = [];

  const documents = await ai.fileSearchStores.documents.list({
    parent: params.fileSearchStoreName,
  });

  for await (const document of documents) {
    result.push({
      name: document.name ?? "",
      displayName: document.displayName ?? document.name ?? "Untitled document",
    });
  }

  return result;
}

export async function deleteStoreDocument(params: { documentName: string }) {
  const ai = getGeminiClient();
  await ai.fileSearchStores.documents.delete({
    name: params.documentName,
    config: {
      force: true,
    },
  });
}
