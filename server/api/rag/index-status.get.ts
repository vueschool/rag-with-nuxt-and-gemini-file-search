export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const jobId = String(query.jobId || "").trim();

  if (!jobId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query string needs a non-empty "jobId" value.',
    });
  }

  // TODO: get the job status

  const job = {
    id: "placeholder-job-id",
    status: "succeeded",
    fileSearchStoreName: "placeholder-store-name",
    displayName: "Placeholder document",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: "Index job not found.",
    });
  }

  return {
    job,
  };
});
