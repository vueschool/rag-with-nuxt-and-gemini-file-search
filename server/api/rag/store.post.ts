export default defineEventHandler(async (event) => {
  const { displayName } = await readBody<{ displayName?: string }>(event);

  // TODO: create the file search store

  return {
    name: "placeholder-store-name",
    displayName,
  };
});
