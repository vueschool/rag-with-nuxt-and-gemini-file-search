export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const jobId = String(query.jobId || "").trim();

  if (!jobId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query string needs a non-empty "jobId" value.',
    });
  }

  const job = await getIndexJob(jobId);

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: "Index job not found.",
    });
  }

  return { job };
});
