export default defineEventHandler(async (event) => {
  const body = await readBody<{
    content?: string;
    displayName?: string;
    storeName?: string;
  }>(event);
  const content = body.content?.trim();
  const fileSearchStoreName = body.storeName?.trim();

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body needs a non-empty "content" field.',
    });
  }

  if (!fileSearchStoreName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body needs a non-empty "storeName" field.',
    });
  }

  const displayName = body.displayName || createDisplayNameFromContent(content);

  const job = await createIndexJob({
    fileSearchStoreName,
    displayName,
  });

  const runIndexing = async () => {
    try {
      await uploadDocumentToStore({
        fileSearchStoreName,
        content,
        displayName,
      });
    } catch (error) {
      await markIndexJobFailed({
        jobId: job.id,
        errorMessage: (error as Error).message,
      });
    }
    await markIndexJobSucceeded(job.id);
  };

  event.waitUntil(runIndexing());

  setResponseStatus(event, 202);

  return {
    ok: true,
    accepted: true,
    jobId: job.id,
    jobStatus: job.status,
    fileSearchStoreName,
  };
});
