export default defineEventHandler(async (event) => {
  const body = await readBody<{ question?: string; storeName?: string }>(event);
  const question = body.question?.trim();
  const fileSearchStoreName = body.storeName?.trim();

  if (!question) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body needs a non-empty "question" field.',
    });
  }

  if (!fileSearchStoreName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body needs a non-empty "storeName" field.',
    });
  }

  // TODO: ask store

  return {
    answer: "This is a placeholder answer.",
    groundingMetadata: [
      {
        groundingChunks: [
          {
            retrievedContext: {
              title: "Untitled document",
              text: "This is a placeholder text.",
            },
          },
        ],
      },
    ],
    fileSearchStoreName: "placeholder-store-name",
  };
});
