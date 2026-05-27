<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: string
  language?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown',
  height: '100%',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let editor: unknown = null
let monaco: unknown = null
let isMounted = false

async function initEditor() {
  if (!containerRef.value) return

  try {
    // Try to load monaco-editor dynamically
    const monacoModule = await import('monaco-editor')
    monaco = monacoModule

    // Initialize the worker
    self.MonacoEnvironment = {
      getWorker() {
        return new monacoModule.editor.EditorWorker()
      },
    }

    editor = monacoModule.editor.create(containerRef.value, {
      value: props.modelValue,
      language: props.language,
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      tabSize: 2,
    })

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue()
      emit('update:modelValue', value)
    })

    isMounted = true
  } catch {
    // In test environments (happy-dom) Monaco won't load, fall back to textarea
    // The textarea will be rendered as a fallback
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (isMounted && editor) {
      const current = editor.getValue()
      if (current !== newVal) {
        editor.setValue(newVal)
      }
    }
  },
)

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
  isMounted = false
})
</script>

<template>
  <div class="monaco-editor-wrapper" :style="{ height }">
    <div ref="containerRef" class="monaco-editor-container" :style="{ height }" />
    <textarea
      v-if="!isMounted"
      class="monaco-editor-fallback"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<style scoped lang="scss">
.monaco-editor-wrapper {
  position: relative;
  width: 100%;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  overflow: hidden;

  .monaco-editor-container {
    width: 100%;
    min-height: 300px;
  }

  .monaco-editor-fallback {
    width: 100%;
    min-height: 300px;
    padding: 12px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    border: none;
    outline: none;
    resize: vertical;
    background: var(--surface, #fff);
    color: var(--text, #1e293b);
  }
}
</style>
