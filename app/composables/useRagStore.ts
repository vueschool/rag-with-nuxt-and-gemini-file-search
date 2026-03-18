import { useLocalStorage } from "@vueuse/core";
import type { Ref } from "vue";

type StoreOption = {
  storeName: string;
  displayName: string;
};

export function useRagStore(params: {
  storeName: Ref<string>;
  isInitializing: Ref<boolean>;
}) {
  const ACTIVE_STORE_KEY = "nuxt-rag-store-name";
  const STORE_LIST_KEY = "nuxt-rag-store-names";
  const persistedStoreName = useLocalStorage<string>(ACTIVE_STORE_KEY, "");
  const persistedStoreList = useLocalStorage<Array<StoreOption | string>>(
    STORE_LIST_KEY,
    [],
  );
  const status = ref("Select an existing store or create a new one.");
  const selectedStoreName = ref("");
  const newStoreDisplayName = ref("");

  function normalizeStoreList(list: Array<StoreOption | string>) {
    return list
      .map((item) => {
        if (typeof item === "string") {
          const value = item.trim();
          if (!value) {
            return null;
          }
          return {
            storeName: value,
            displayName: value,
          } satisfies StoreOption;
        }

        const storeName = String(item.storeName || "").trim();
        const displayName = String(item.displayName || "").trim() || storeName;
        if (!storeName) {
          return null;
        }

        return {
          storeName,
          displayName,
        } satisfies StoreOption;
      })
      .filter((item): item is StoreOption => Boolean(item));
  }

  const storeOptions = computed(() =>
    normalizeStoreList(persistedStoreList.value),
  );

  function addStoreToHistory(storeName: string, displayName?: string) {
    const normalizedStoreName = storeName.trim();
    const normalizedDisplayName = (displayName || "").trim();
    if (!normalizedStoreName) {
      return;
    }

    const existing = storeOptions.value.find(
      (option) => option.storeName === normalizedStoreName,
    );

    const nextEntry: StoreOption = {
      storeName: normalizedStoreName,
      displayName:
        normalizedDisplayName || existing?.displayName || normalizedStoreName,
    };

    const next = [
      nextEntry,
      ...storeOptions.value.filter(
        (option) => option.storeName !== normalizedStoreName,
      ),
    ];

    persistedStoreList.value = next;
  }

  function createDefaultStoreDisplayName() {
    return `nuxt-rag-store-${Date.now()}`;
  }

  function selectExistingStore() {
    const nextStoreName = selectedStoreName.value.trim();
    if (!nextStoreName) {
      status.value = "Pick a previously used store.";
      return;
    }

    params.storeName.value = nextStoreName;
    const selectedOption = storeOptions.value.find(
      (option) => option.storeName === nextStoreName,
    );
    addStoreToHistory(nextStoreName, selectedOption?.displayName);
    status.value = "Store selected.";
  }

  async function createNewStoreInternal(displayNameOverride?: string) {
    const displayName = displayNameOverride || newStoreDisplayName.value.trim();
    if (!displayName) {
      status.value = "Display name is required when creating a new store.";
      return;
    }

    params.isInitializing.value = true;
    status.value = "Creating a new File Search store...";

    try {
      const response = await $fetch("/api/rag/store", {
        method: "POST",
        body: {
          displayName,
        },
      });

      const nextStoreName = response?.name || "";
      params.storeName.value = nextStoreName;
      selectedStoreName.value = nextStoreName;
      addStoreToHistory(nextStoreName, displayName);
      status.value = "Created and selected a new File Search store.";
      newStoreDisplayName.value = "";
    } catch (error: any) {
      status.value = `Store initialization failed: ${error?.data?.statusMessage || error.message}`;
    } finally {
      params.isInitializing.value = false;
    }
  }

  async function createNewStore() {
    await createNewStoreInternal();
  }

  function clearStoreSelection() {
    params.storeName.value = "";
    selectedStoreName.value = "";
    status.value = "Store selection cleared.";
  }

  onMounted(() => {
    const savedStore = persistedStoreName.value?.trim();
    if (savedStore) {
      params.storeName.value = savedStore;
      selectedStoreName.value = savedStore;
      addStoreToHistory(savedStore);
      status.value = "Reusing previously selected store from this browser.";
      return;
    }

    createNewStoreInternal("Default Store");
  });

  watch(params.storeName, (value) => {
    persistedStoreName.value = value;
    if (!selectedStoreName.value.trim() && value) {
      selectedStoreName.value = value;
    }
    if (value) {
      addStoreToHistory(value);
    }
  });

  return {
    status,
    storeOptions,
    selectedStoreName,
    newStoreDisplayName,
    selectExistingStore,
    createNewStore,
    clearStoreSelection,
  };
}
