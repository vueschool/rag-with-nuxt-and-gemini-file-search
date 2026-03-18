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

  const displayName = body.displayName || "Untitled document";

  // TODO: create the index job
  // const job = {
  //   id: "placeholder-job-id",
  //   status: "pending",
  //   fileSearchStoreName: "placeholder-store-name",
  //   displayName,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // };

  // const runIndexing = async () => {
  //   // TODO: implement the indexing logic
  // };

  // event.waitUntil(runIndexing());

  // setResponseStatus(event, 202);

  await uploadDocumentToStore({
    fileSearchStoreName,
    content,
    displayName,
  });

  return {
    ok: true,
    accepted: true,
    jobId: "job-id",
    jobStatus: "succeeded",
    fileSearchStoreName,
  };
});
