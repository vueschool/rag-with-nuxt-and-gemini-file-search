<script setup lang="ts">
const storeName = defineModel<string>("storeName", { required: true });
const isInitializing = defineModel<boolean>("isInitializing", {
  required: true,
});
const {
  status,
  storeOptions,
  selectedStoreName,
  newStoreDisplayName,
  selectExistingStore,
  createNewStore,
  clearStoreSelection,
} = useRagStore({
  storeName,
  isInitializing,
});
</script>

<template>
  <section class="card">
    <h2>1) Choose a File Search store</h2>
    <p class="helper">
      Pick an existing saved store, or create a fresh store with a display name.
    </p>

    <p v-if="storeName" class="active-store">
      Active store: <code>{{ storeName }}</code>
    </p>

    <label class="label">Use existing store</label>
    <div class="row">
      <select v-model="selectedStoreName">
        <option disabled value="">Select a saved store</option>
        <ClientOnly>
          <option
            v-for="option in storeOptions"
            :key="option.storeName"
            :value="option.storeName"
          >
            {{ option.displayName }}
          </option>
        </ClientOnly>
      </select>
      <button
        type="button"
        :disabled="isInitializing || !selectedStoreName"
        @click="selectExistingStore"
      >
        Use Store
      </button>
    </div>

    <div class="divider" />

    <label class="label">Create new store (display name required)</label>
    <div class="row">
      <input
        v-model="newStoreDisplayName"
        type="text"
        placeholder="team-notes-store"
      />
      <button
        type="button"
        :disabled="isInitializing || !newStoreDisplayName.trim()"
        @click="createNewStore"
      >
        {{ isInitializing ? "Creating..." : "Create Store" }}
      </button>
    </div>

    <p>{{ status }}</p>
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

.helper {
  margin: 0 0 0.75rem;
  color: #475569;
}

.active-store {
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.label {
  display: block;
  font-size: 0.85rem;
  color: #334155;
  margin-bottom: 0.35rem;
}

.row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

input,
select {
  flex: 1;
  box-sizing: border-box;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #fff;
}

.divider {
  border-top: 1px dashed #cbd5e1;
  margin: 0.25rem 0 0.85rem;
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

.text-button {
  border: none;
  background: transparent;
  color: #2563eb;
  padding: 0;
}

code {
  background: #f1f5f9;
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
}
</style>
