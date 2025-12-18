<template>
  <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-500 text-sm font-medium">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
        <div v-if="trend" :class="['text-xs font-semibold mt-2', trendPositive ? 'text-green-600' : 'text-red-600']">
          <Iconify 
            :icon="trendPositive ? 'mdi:trending-up' : 'mdi:trending-down'" 
            :width="14" 
            :height="14"
            class="inline mr-1"
          />
          {{ trend }}
        </div>
      </div>
      <div :class="['rounded-full p-4 flex items-center justify-center', bgColor]">
        <Iconify :icon="icon" :width="28" :height="28" :class="textColor" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Iconify from '@/components/Iconify.vue'

interface Props {
  title: string
  value: string
  icon: string
  trend?: string
  trendPositive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trendPositive: true
})

const colorMap: Record<string, { bg: string; text: string }> = {
  'mdi:account-group': { bg: 'bg-blue-100', text: 'text-blue-600' },
  'mdi:cash-multiple': { bg: 'bg-green-100', text: 'text-green-600' },
  'mdi:shopping-cart': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  'mdi:chart-line': { bg: 'bg-purple-100', text: 'text-purple-600' }
}

const bgColor = computed(() => colorMap[props.icon]?.bg || 'bg-gray-100')
const textColor = computed(() => colorMap[props.icon]?.text || 'text-gray-600')
</script>
