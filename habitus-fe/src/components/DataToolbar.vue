<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <div class="relative flex-1 sm:max-w-xs">
          <Iconify icon="mdi:magnify" :width="18" :height="18" class="absolute left-3 top-3 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @keyup="handleSearch"
          />
        </div>

        <!-- Filter Dropdown -->
        <div v-if="filters.length > 0" class="relative z-20">
          <button
            @click.stop="toggleFilterMenu"
            :class="[
              'flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition',
              hasActiveFilter ? 'border-blue-500 bg-blue-50' : ''
            ]"
          >
            <Iconify icon="mdi:filter" :width="18" :height="18" />
            <span class="text-sm font-medium">Filter</span>
            <Iconify icon="mdi:chevron-down" :width="16" :height="16" />
          </button>

          <!-- Filter Menu -->
          <Transition name="fade">
            <div
              v-if="showFilterMenu"
              @click.stop
              class="absolute top-full mt-2 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-xs"
            >
              <div class="p-4 space-y-3">
                <div v-for="filter in filters" :key="filter.id" class="flex items-center gap-2">
                  <input
                    :id="`filter-${filter.id}`"
                    v-model="activeFilters"
                    type="checkbox"
                    :value="filter.id"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    @change="handleFilter"
                  />
                  <label :for="`filter-${filter.id}`" class="text-sm text-gray-700 cursor-pointer">
                    {{ filter.label }}
                  </label>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Right Section: Actions -->
      <div class="flex flex-wrap gap-2 justify-end">
        <!-- Export Button -->
        <button
          v-if="showExport"
          @click="handleExport"
          :disabled="isExporting"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm font-medium',
            isExporting ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          title="Export"
        >
          <Iconify icon="mdi:download" :width="18" :height="18" />
          <span class="text-sm font-medium hidden sm:inline">{{ isExporting ? 'Exporting' : 'Export' }}</span>
        </button>

        <!-- Create Button -->
        <button
          v-if="showCreate"
          @click="handleCreate"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          :title="createLabel"
        >
          <Iconify icon="mdi:plus" :width="18" :height="18" />
          <span class="hidden sm:inline">{{ createLabel }}</span>
        </button>

              <button
          @click="handleRefresh"
          :disabled="isRefreshing"
          :class="[
            'flex items-center gap-2 px-2 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600',
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          title="Refresh"
        >
          <Iconify
            icon="mdi:refresh"
            :width="15"
            :height="15"
            :class="{ 'animate-spin': isRefreshing }"
          />
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilter" class="mt-4 flex flex-wrap gap-2">
      <span class="text-xs text-gray-600">Active filters:</span>
      <div v-for="filterId in activeFilters" :key="filterId" class="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
        <span>{{ filters.find(f => f.id === filterId)?.label }}</span>
        <button @click="removeFilter(filterId)" class="hover:text-blue-600">
          <Iconify icon="mdi:close" :width="14" :height="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed,} from 'vue'
import Iconify from './Iconify.vue'

export interface FilterOption {
  id: string
  label: string
}

export interface ToolbarProps {
  showCreate?: boolean
  showExport?: boolean
  createLabel?: string
  filters?: FilterOption[]
  searchPlaceholder?: string
}

interface Emits {
  (event: 'create'): void
  (event: 'export'): void
  (event: 'refresh'): void
  (event: 'search', query: string): void
  (event: 'filter', filters: string[]): void
}

const props = withDefaults(defineProps<ToolbarProps>(), {
  showCreate: true,
  showExport: true,
  createLabel: 'Create New',
  filters: () => [],
  searchPlaceholder: 'Search...'
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const activeFilters = ref<string[]>([])
const showFilterMenu = ref(false)
const isRefreshing = ref(false)
const isExporting = ref(false)

const hasActiveFilter = computed(() => activeFilters.value.length > 0)

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleFilter = () => {
  emit('filter', activeFilters.value)
  // Keep filter menu open after selection
}

const removeFilter = (filterId: string) => {
  activeFilters.value = activeFilters.value.filter(f => f !== filterId)
  emit('filter', activeFilters.value)
}

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}

const handleCreate = () => {
  emit('create')
}

const handleExport = async () => {
  isExporting.value = true
  try {
    emit('export')
    await new Promise(resolve => setTimeout(resolve, 1500))
  } finally {
    isExporting.value = false
  }
}

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    emit('refresh')
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
