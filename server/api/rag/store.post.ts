export default defineEventHandler(async (event) => {
  const body = await readBody<{ displayName?: string }>(event);
  const displayName = body.displayName?.trim();

  // TODO: create the file search store

  return {
    name: "placeholder-store-name",
    displayName,
  };
});
