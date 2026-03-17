export default defineEventHandler(async (event) => {
  const body = await readBody<{ displayName?: string }>(event);
  const displayName = body.displayName?.trim() || createStoreDisplayName();

  // TODO: create the file search store
  const fileSearchStoreName = "placeholder-store-name";

  if (!fileSearchStoreName) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create a File Search store.",
    });
  }

  return {
    fileSearchStoreName,
  };
});
