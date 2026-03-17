export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const fileSearchStoreName = String(query.storeName || "").trim();

  if (!fileSearchStoreName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query string needs a non-empty "storeName" value.',
    });
  }

  // TODO: list documents

  return {
    fileSearchStoreName: "placeholder-store-name",
    documents: [
      {
        name: "placeholder-document-name",
        displayName: "Placeholder document",
      },
    ],
  };
});
