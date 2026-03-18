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

  const result = await askStore({
    fileSearchStoreName,
    question,
  });

  return {
    answer: result.text,
    groundingMetadata: result.groundingMetadata,
    fileSearchStoreName: "placeholder-store-name",
  };
});
