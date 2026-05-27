<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const postId = route.params.id as string | undefined
</script>

<template>
  <div class="editor-view">
    <h1>编辑器</h1>
    <p v-if="postId">编辑文章: {{ postId }}</p>
    <p v-else>创建新文章</p>
  </div>
</template>

<style scoped lang="scss">
.editor-view {
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
