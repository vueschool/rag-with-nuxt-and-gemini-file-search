<template>
  <NuxtRouteAnnouncer />
  <div class="shell">
    <header class="shell-header">
      <h1>Nuxt RAG App</h1>
      <nav>
        <NuxtLink to="/">Chat</NuxtLink>
        <NuxtLink to="/documents">Documents</NuxtLink>
      </nav>
    </header>
    <NuxtPage />
  </div>
</template>

<style scoped>
.shell {
  max-width: 860px;
  margin: 2rem auto;
  padding: 0 1rem 2rem;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.shell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.25rem;
}

nav {
  display: flex;
  gap: 0.75rem;
}

a {
  text-decoration: none;
  color: #1d4ed8;
  font-weight: 600;
}
</style>
