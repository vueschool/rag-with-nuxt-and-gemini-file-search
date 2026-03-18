<script setup lang="ts">
type IndexJobStatus = "pending" | "succeeded" | "failed";

const props = defineProps<{
  isInitializing: boolean;
}>();

const emit = defineEmits<{
  indexingChange: [value: boolean];
}>();

const storeName = defineModel<string>("storeName", { required: true });
const sourceText = ref(`# Nuxt + RAG demo notes

RAG stands for Retrieval-Augmented Generation.
It improves answers by retrieving relevant context from your own documents.
`);
const status = ref("Ready to index a document.");
const isIndexing = ref(false);
const indexJobId = ref("");
const indexJobStatus = ref<IndexJobStatus | "idle">("idle");
const trimmedStoreName = computed(() => storeName.value.trim());

watch(
  isIndexing,
  (value) => {
    emit("indexingChange", value);
  },
  { immediate: true },
);

async function pollIndexStatus(jobId: string) {
  const MAX_ATTEMPTS = 120;
  const POLL_INTERVAL_MS = 1000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const response = await $fetch("/api/rag/index-status", {
      query: { jobId },
    });

    indexJobStatus.value = response.job?.status || "pending";

    if (indexJobStatus.value === "succeeded") {
      status.value = "Indexed successfully. You can ask questions now.";
      return;
    }

    if (indexJobStatus.value === "failed") {
      const reason = response.job?.errorMessage || "Unknown indexing error";
      throw new Error(reason);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    "Indexing is taking longer than expected. Keep polling with the current job ID.",
  );
}

async function indexDocument() {
  if (!trimmedStoreName.value) {
    status.value = "Set a File Search store name before indexing.";
    return;
  }

  isIndexing.value = true;
  status.value = "Starting indexing job...";
  indexJobId.value = "";
  indexJobStatus.value = "idle";

  try {
    const response = await $fetch("/api/rag/index-document", {
      method: "POST",
      body: {
        content: sourceText.value,
        storeName: trimmedStoreName.value,
      },
    });

    storeName.value = response.fileSearchStoreName;
    indexJobId.value = response.jobId;
    indexJobStatus.value = response.jobStatus || "pending";
    status.value = "Indexing started. Waiting for completion...";
    await pollIndexStatus(response.jobId);
  } catch (error: any) {
    status.value = `Indexing failed: ${error?.data?.statusMessage || error.message}`;
  } finally {
    isIndexing.value = false;
  }
}
</script>

<template>
  <section class="card">
    <h2>2) Add source content</h2>
    <textarea v-model="sourceText" rows="10" spellcheck="false" />
    <button
      :disabled="isIndexing || props.isInitializing"
      @click="indexDocument"
    >
      {{ isIndexing ? "Indexing..." : "Index Document" }}
    </button>
    <p>{{ status }}</p>
    <p v-if="indexJobId">
      Index job: <code>{{ indexJobId }}</code> ({{ indexJobStatus }})
    </p>
  </section>
</template>

<style scoped>
.card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #ffffff;
}

h2 {
  margin: 0 0 0.75rem;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}

button {
  border: 1px solid #1d4ed8;
  border-radius: 0.5rem;
  background: #2563eb;
  color: #fff;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

code {
  background: #f1f5f9;
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
}
</style>
