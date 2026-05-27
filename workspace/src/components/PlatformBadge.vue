<script setup lang="ts">
import { Globe, MessageCircle, Image } from 'lucide-vue-next'
import { computed } from 'vue'

const platformIcons = {
  blog: Globe,
  wechat: MessageCircle,
  xiaohongshu: Image,
}

const platformLabels: Record<string, string> = {
  blog: 'Blog',
  wechat: 'WeChat',
  xiaohongshu: 'Xiaohongshu',
}

const platformClasses: Record<string, string> = {
  blog: 'platform-badge--blog',
  wechat: 'platform-badge--wechat',
  xiaohongshu: 'platform-badge--xhs',
}

const props = defineProps<{
  platform: 'blog' | 'wechat' | 'xiaohongshu'
}>()

const icon = computed(() => platformIcons[props.platform])
const label = computed(() => platformLabels[props.platform])
const cls = computed(() => platformClasses[props.platform])
</script>

<template>
  <span :class="['platform-badge', cls]" :title="label">
    <component :is="icon" :size="12" class="platform-badge-icon" />
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  line-height: 1.4;

  &--blog {
    background: #ede9fe;
    color: #5b21b6;
  }

  &--wechat {
    background: #d1fae5;
    color: #065f46;
  }

  &--xhs {
    background: #fce7f3;
    color: #9d174d;
  }
}

.platform-badge-icon {
  flex-shrink: 0;
}
</style>
