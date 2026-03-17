<script setup lang="ts">
const storeName = ref("");
const isInitializingStore = ref(false);
const isIndexing = ref(false);
</script>

<template>
  <main class="page">
    <p class="lead">
      Index a document, then ask questions grounded in that document.
    </p>

    <RagStoreSelectorCard
      v-model:store-name="storeName"
      v-model:is-initializing="isInitializingStore"
    />

    <RagIndexDocumentCard
      v-model:store-name="storeName"
      :is-initializing="isInitializingStore"
      @indexing-change="isIndexing = $event"
    />

    <RagAskCard
      v-model:store-name="storeName"
      :is-initializing="isInitializingStore"
      :is-indexing="isIndexing"
    />
  </main>
</template>

<style scoped>
.page {
  padding-bottom: 2rem;
}

.lead {
  color: #334155;
  margin-bottom: 1rem;
}
</style>
