import { GoogleGenAI } from "@google/genai";

function getApiKey() {
  const runtimeConfig = useRuntimeConfig();
  const apiKey =
    runtimeConfig.googleGenerativeAiApiKey ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment.",
    });
  }

  return apiKey;
}

function getClient() {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

export async function createFileSearchStore(params: { displayName: string }) {
  const ai = getClient();
  const store = await ai.fileSearchStores.create({
    config: {
      displayName: params.displayName,
    },
  });

  return store.name ?? "";
}

async function waitForOperation(ai: GoogleGenAI, operation: any) {
  let current = operation;
  while (!current.done) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("current", current);
    current = await ai.operations.get({ operation: current });
  }
  return current;
}

export async function uploadTextToStore(params: {
  fileSearchStoreName: string;
  content: string;
  displayName: string;
}) {
  const ai = getClient();
  const markdownBlob = new Blob([params.content], { type: "text/markdown" });
  const operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: markdownBlob,
    fileSearchStoreName: params.fileSearchStoreName,
    config: {
      displayName: params.displayName,
      mimeType: "text/markdown",
    },
  });

  await waitForOperation(ai, operation);
}

export async function askStore(params: {
  fileSearchStoreName: string;
  question: string;
}) {
  const ai = getClient();
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
  const ai = getClient();
  const result: Array<{
    name: string;
    displayName: string;
  }> = [];

  const documents = await ai.fileSearchStores.documents.list({
    parent: params.fileSearchStoreName,
  });

  for await (const document of documents as any) {
    result.push({
      name: document.name ?? "",
      displayName: document.displayName ?? document.name ?? "Untitled document",
    });
  }

  return result;
}

export async function deleteStoreDocument(params: { documentName: string }) {
  const ai = getClient();
  await ai.fileSearchStores.documents.delete({
    name: params.documentName,
    config: {
      force: true,
    },
  });
}
