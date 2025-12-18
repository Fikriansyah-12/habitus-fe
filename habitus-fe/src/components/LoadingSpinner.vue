<template>
  <div v-if="fullscreen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
      <div
        :class="[
          'rounded-full animate-spin',
          sizeClasses
        ]"
        :style="{
          borderTop: `4px solid #3b82f6`,
          borderRight: `4px solid transparent`,
          borderBottom: `4px solid transparent`,
          borderLeft: `4px solid transparent`
        }"
      ></div>
      <p v-if="text" class="text-gray-700 font-medium">{{ text }}</p>
    </div>
  </div>
  <div v-else :class="['inline-block animate-spin rounded-full', sizeClasses]"
    :style="{
      borderTop: `3px solid #3b82f6`,
      borderRight: `3px solid transparent`,
      borderBottom: `3px solid transparent`,
      borderLeft: `3px solid transparent`
    }"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fullscreen?: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  fullscreen: false,
  text: ''
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  return sizes['md' as keyof typeof sizes]
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
