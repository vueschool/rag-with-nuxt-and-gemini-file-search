<script setup lang="ts">
type Attribution = {
  title: string;
  text: string;
  fileSearchStore: string;
};

const props = defineProps<{
  isInitializing: boolean;
  isIndexing: boolean;
}>();

const storeName = defineModel<string>("storeName", { required: true });
const question = ref("What does RAG stand for and why is it useful?");
const answer = ref("");
const status = ref("Ask a question after your document has finished indexing.");
const attributions = ref<Attribution[]>([]);
const isAsking = ref(false);
const trimmedStoreName = computed(() => storeName.value.trim());

const citationBadges = computed(() => {
  return Array.from(
    new Set(
      attributions.value
        .map((attribution) => attribution.title)
        .filter(Boolean),
    ),
  );
});

const answerMarkdown = computed(() => answer.value || "_No answer yet._");

async function askQuestion() {
  if (!trimmedStoreName.value) {
    status.value = "Set a File Search store name before asking.";
    return;
  }

  isAsking.value = true;
  status.value = "Searching indexed docs and generating answer...";

  try {
    const response = await $fetch("/api/rag/ask", {
      method: "POST",
      body: {
        question: question.value,
        storeName: trimmedStoreName.value,
      },
    });

    storeName.value = response.fileSearchStoreName;
    answer.value = response.answer || "No answer returned.";
    if (response.groundingMetadata?.groundingChunks) {
      attributions.value = response.groundingMetadata?.groundingChunks?.map(
        (chunk) => {
          return {
            title: chunk.retrievedContext?.title || "",
            text: chunk.retrievedContext?.text || "",
            fileSearchStore: response.fileSearchStoreName,
          };
        },
      );
    } else {
      attributions.value = [];
    }

    status.value = "Answer ready.";
  } catch (error: any) {
    status.value = `Question failed: ${error?.data?.statusMessage || error.message}`;
  } finally {
    isAsking.value = false;
  }
}
</script>

<template>
  <section class="card">
    <h2>3) Ask a question</h2>
    <input v-model="question" type="text" />
    <button
      :disabled="isAsking || props.isInitializing || props.isIndexing"
      @click="askQuestion"
    >
      {{ isAsking ? "Asking..." : "Ask" }}
    </button>
    <p>{{ status }}</p>
  </section>

  <section class="card">
    <h2>Answer</h2>
    <MDC :value="answerMarkdown" tag="article" class="answer-md" />
    <div v-if="citationBadges.length > 0" class="citation-badges">
      <span
        v-for="(badge, index) in citationBadges"
        :key="`${badge}-${index}`"
        class="citation-badge"
      >
        source: {{ badge }}
      </span>
    </div>
    <div v-if="attributions.length > 0" class="attribution-list">
      <h3>Document attribution</h3>
      <ul>
        <li v-for="(attribution, index) in attributions" :key="index">
          <strong>{{ attribution.title }}</strong>
          <p>{{ attribution.text }}</p>
        </li>
      </ul>
    </div>
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

input {
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

.citation-badges {
  margin-top: 0.6rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.citation-badge {
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 0.78rem;
  padding: 0.2rem 0.55rem;
}

.attribution-list {
  margin-top: 1rem;
}

.attribution-list h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.attribution-list ul {
  margin: 0;
  padding-left: 1.2rem;
}

.attribution-list li + li {
  margin-top: 0.6rem;
}

.attribution-list p {
  margin: 0.25rem 0 0;
  color: #334155;
}

.answer-md :deep(p) {
  margin: 0 0 0.75rem;
}

.answer-md :deep(p:last-child) {
  margin-bottom: 0;
}

.answer-md :deep(ul),
.answer-md :deep(ol) {
  margin: 0.5rem 0 0.75rem 1.2rem;
}

.answer-md :deep(code) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.answer-md :deep(pre) {
  overflow-x: auto;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #f8fafc;
}
</style>
