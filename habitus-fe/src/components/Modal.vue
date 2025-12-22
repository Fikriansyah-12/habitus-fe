<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
        <button
          @click="close"
          class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <slot />

      <div v-if="showFooter" class="flex gap-3 justify-end pt-4 border-t">
        <button
          @click="close"
          :disabled="isLoading"
          class="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          {{ cancelLabel }}
        </button>
        <button
          @click="submit"
          :disabled="isLoading"
          class="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
        >
          {{ isLoading ? loadingLabel : submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  submitLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  isLoading?: boolean
  showFooter?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  loadingLabel: 'Saving...',
  isLoading: false,
  showFooter: true
})

const emit = defineEmits<Emits>()

const close = () => {
  emit('close')
}

const submit = () => {
  emit('submit')
}
</script>
