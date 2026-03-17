export default defineEventHandler(async (event) => {
  const body = await readBody<{ documentName?: string }>(event);
  const documentName = body.documentName?.trim();

  if (!documentName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body needs a non-empty "documentName" field.',
    });
  }

  // TODO: delete document

  return { ok: true };
});
