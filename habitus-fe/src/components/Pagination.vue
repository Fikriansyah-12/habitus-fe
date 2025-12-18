<template>
  <div v-if="totalPages > 0" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
    <!-- Info Text -->
    <p class="text-sm text-gray-600">
      Showing <span class="font-semibold">{{ startItem }}</span> to <span class="font-semibold">{{ endItem }}</span> of <span class="font-semibold">{{ totalItems }}</span> results
    </p>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous Button -->
      <button
        @click="goToPrevious"
        :disabled="currentPage === 1"
        :class="[
          'px-3 py-2 border rounded-lg text-sm font-medium transition',
          currentPage === 1
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
        ]"
      >
        <Iconify icon="mdi:chevron-left" :width="18" :height="18" class="inline mr-1" />
        <span class="hidden sm:inline">Previous</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex gap-1">
        <template v-for="page in visiblePages" :key="page">
          <!-- Ellipsis -->
          <span v-if="page === '...'" class="px-2 py-2 text-gray-400">...</span>

          <!-- Page Button -->
          <button
            v-else
            @click="goToPage(page as number)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition',
              currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
            ]"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Next Button -->
      <button
        @click="goToNext"
        :disabled="currentPage === totalPages"
        :class="[
          'px-3 py-2 border rounded-lg text-sm font-medium transition',
          currentPage === totalPages
            ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
        ]"
      >
        <span class="hidden sm:inline">Next</span>
        <Iconify icon="mdi:chevron-right" :width="18" :height="18" class="inline ml-1" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Iconify from './Iconify.vue'

export interface PaginationProps {
  totalItems: number
  itemsPerPage?: number
  currentPage?: number
  maxVisiblePages?: number
  showItemsPerPage?: boolean
}

interface Emits {
  (event: 'page-change', page: number): void
  (event: 'items-per-page-change', itemsPerPage: number): void
}

const props = withDefaults(defineProps<PaginationProps>(), {
  itemsPerPage: 10,
  currentPage: 1,
  maxVisiblePages: 2,
  showItemsPerPage: false
})

const emit = defineEmits<Emits>()

const internalCurrentPage = ref(props.currentPage)
const itemsPerPageValue = ref(props.itemsPerPage)

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / itemsPerPageValue.value)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (internalCurrentPage.value - 1) * itemsPerPageValue.value + 1
})

const endItem = computed(() => {
  const end = internalCurrentPage.value * itemsPerPageValue.value
  return end > props.totalItems ? props.totalItems : end
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = props.maxVisiblePages
  const total = totalPages.value

  if (total <= maxVisible) {
    // Show all pages if total is less than maxVisible
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of the range
    let rangeStart = Math.max(2, internalCurrentPage.value - Math.floor(maxVisible / 2))
    let rangeEnd = Math.min(total - 1, rangeStart + maxVisible - 3)

    // Adjust range if at the end
    if (rangeEnd - rangeStart + 1 < maxVisible - 2) {
      rangeStart = Math.max(2, rangeEnd - maxVisible + 3)
    }

    // Add ellipsis before range
    if (rangeStart > 2) {
      pages.push('...')
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis after range
    if (rangeEnd < total - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    internalCurrentPage.value = page
    emit('page-change', page)
  }
}

const goToPrevious = () => {
  if (internalCurrentPage.value > 1) {
    goToPage(internalCurrentPage.value - 1)
  }
}

const goToNext = () => {
  if (internalCurrentPage.value < totalPages.value) {
    goToPage(internalCurrentPage.value + 1)
  }
}

</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
}
</style>
