import { randomUUID } from "node:crypto";

export type RAGIndexJobStatus = "pending" | "succeeded" | "failed";

export type RAGIndexJob = {
  id: string;
  status: RAGIndexJobStatus;
  fileSearchStoreName: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
};

export const INDEX_JOB_PREFIX = "rag:index-job:";

export function getJobKey(jobId: string) {
  return `${INDEX_JOB_PREFIX}${jobId}`;
}

export function getJobStorage() {
  return useStorage("data");
}

export async function createIndexJob(params: {
  fileSearchStoreName: string;
  displayName: string;
}) {
  const job: RAGIndexJob = {
    id: randomUUID(),
    status: "pending",
    fileSearchStoreName: params.fileSearchStoreName,
    displayName: params.displayName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await getJobStorage().setItem(getJobKey(job.id), job);
  return job;
}

export async function getIndexJob(jobId: string) {
  return await getJobStorage().getItem<RAGIndexJob>(getJobKey(jobId));
}

export async function markIndexJobSucceeded(jobId: string) {
  const existing = await getIndexJob(jobId);
  if (!existing) {
    return;
  }

  const next: RAGIndexJob = {
    ...existing,
    status: "succeeded",
    updatedAt: new Date().toISOString(),
    errorMessage: undefined,
  };

  await getJobStorage().setItem(getJobKey(jobId), next);
}

export async function markIndexJobFailed(params: {
  jobId: string;
  errorMessage: string;
}) {
  const existing = await getIndexJob(params.jobId);
  if (!existing) {
    return;
  }

  const next: RAGIndexJob = {
    ...existing,
    status: "failed",
    updatedAt: new Date().toISOString(),
    errorMessage: params.errorMessage,
  };

  await getJobStorage().setItem(getJobKey(params.jobId), next);
}
