<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const postId = route.params.id as string
</script>

<template>
  <div class="preview-view">
    <h1>预览</h1>
    <p>预览文章: {{ postId }}</p>
  </div>
</template>

<style scoped lang="scss">
.preview-view {
  max-width: 960px;
}

h1 {
  font-size: var(--text-h1, 1.75rem);
  font-weight: 700;
  margin-bottom: 8px;
}

p {
  color: var(--text-secondary, #64748b);
}
</style>
