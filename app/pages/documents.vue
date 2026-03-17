<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

type StoreDocument = {
  name: string;
  displayName: string;
};

const route = useRoute();
const storeNameInput = ref("");
const activeStoreName = ref("");
const documents = ref<StoreDocument[]>([]);
const status = ref("Enter a File Search store name to load documents.");
const isLoading = ref(false);
const deletingName = ref("");
const STORE_KEY = "nuxt-rag-store-name";
const persistedStoreName = useLocalStorage<string>(STORE_KEY, "");

async function loadDocuments(storeName?: string) {
  const nextStoreName = storeName?.trim();
  if (!nextStoreName) {
    status.value = "Store name is required.";
    documents.value = [];
    activeStoreName.value = "";
    return;
  }

  isLoading.value = true;
  status.value = "Loading documents...";

  try {
    const query = { storeName: nextStoreName };
    const response = await $fetch("/api/rag/documents", { query });
    activeStoreName.value = response.fileSearchStoreName || "";
    documents.value = response.documents || [];
    status.value = `Loaded ${documents.value.length} document(s).`;
  } catch (error: any) {
    status.value = `Loading failed: ${error?.data?.statusMessage || error.message}`;
  } finally {
    isLoading.value = false;
  }
}

async function deleteDocument(documentName: string) {
  deletingName.value = documentName;
  status.value = "Deleting document...";

  try {
    await $fetch("/api/rag/documents", {
      method: "DELETE",
      body: { documentName },
    });
    status.value = "Document deleted.";
    await loadDocuments(activeStoreName.value || storeNameInput.value);
  } catch (error: any) {
    status.value = `Delete failed: ${error?.data?.statusMessage || error.message}`;
  } finally {
    deletingName.value = "";
  }
}

onMounted(() => {
  const queryStore =
    typeof route.query.store === "string" ? route.query.store : "";
  if (queryStore) {
    storeNameInput.value = queryStore;
    loadDocuments(queryStore);
    return;
  }
  const savedStore = persistedStoreName.value?.trim();
  if (savedStore) {
    storeNameInput.value = savedStore;
    loadDocuments(savedStore);
  }
});

watch(activeStoreName, (value) => {
  if (!value) {
    return;
  }
  persistedStoreName.value = value;
});
</script>

<template>
  <main class="page">
    <p class="lead">
      View and delete documents from your active Gemini File Search store.
    </p>

    <section class="card">
      <h2>Store</h2>
      <input
        v-model="storeNameInput"
        type="text"
        placeholder="fileSearchStores/your-store-name"
      />
      <div class="actions">
        <button
          :disabled="isLoading"
          @click="loadDocuments(storeNameInput || undefined)"
        >
          {{ isLoading ? "Loading..." : "Load Documents" }}
        </button>
      </div>
      <p>{{ status }}</p>
      <p v-if="activeStoreName">
        Active store: <code>{{ activeStoreName }}</code>
      </p>
    </section>

    <section class="card">
      <h2>Uploaded documents</h2>
      <p v-if="documents.length === 0">No documents found.</p>
      <ul v-else class="document-list">
        <li v-for="document in documents" :key="document.name">
          <div class="document-meta">
            <strong>{{ document.displayName }}</strong>
            <code>{{ document.name }}</code>
          </div>
          <button
            class="danger"
            :disabled="deletingName === document.name"
            @click="deleteDocument(document.name)"
          >
            {{ deletingName === document.name ? "Deleting..." : "Delete" }}
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.lead {
  color: #334155;
}

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

.actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

button {
  border: 1px solid #1d4ed8;
  border-radius: 0.5rem;
  background: #2563eb;
  color: #fff;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.danger {
  border-color: #b91c1c;
  background: #dc2626;
}

code {
  background: #f1f5f9;
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
}

.document-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.document-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 0;
}

.document-list li:first-child {
  border-top: 0;
}

.document-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
</style>
