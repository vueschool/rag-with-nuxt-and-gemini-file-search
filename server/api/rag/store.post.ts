export default defineEventHandler(async (event) => {
  const { displayName } = await readBody<{ displayName?: string }>(event);

  const fileSearchStore = await createFileSearchStore({
    displayName,
  });
  return fileSearchStore;
});
