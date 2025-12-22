<script setup lang="ts">
import Breadcrumb from "@/components/Breadcrumb.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/utils/api";
import { StorageService } from "@/utils/storage";
import { useOnsiteRequest } from "@/composables/useOnsiteRequest";
import type { UpdateOnsiteRequestDto } from "@/types";

const route = useRoute();
const router = useRouter();
const id = route.query.id as string;

const { fetchTimeline, requestLogs } = useOnsiteRequest();

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const userName = ref("");
const showTimeline = ref(false);

const formatToDatetimeLocal = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error, isoString);
    return "";
  }
};

const statuses = [
  { label: "Requested", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" }
];

const purposes = [
  { label: "Pengiriman Barang", value: "PENGIRIMAN_BARANG" },
  { label: "Meeting", value: "MEETING" },
  { label: "Survey", value: "SURVEY" },
  { label: "Dokumentasi", value: "DOKUMENTASI" },
];

const formData = ref<UpdateOnsiteRequestDto>({
  purpose: "",
  onsiteAt: "",
  address: "",
  status: ""
});

const originalData = ref<UpdateOnsiteRequestDto>({});
const requestItems = ref<any[]>([]);
const quoteInfo = ref<any>(null);
const originalISODateTime = ref<string>("");

onMounted(async () => {
  const user = StorageService.getUser();
  if (user) {
    userName.value = user.name;
  }

  if (!id) {
    errorMessage.value = "Request ID not found";
    return;
  }

  await loadRequest();
  await loadTimeline();
});

const loadRequest = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const request = await apiClient.getOnsiteRequestById(id);
    
    const rawDateTime = request.onsiteAt || request.startDate || "";
    const formattedDateTime = formatToDatetimeLocal(rawDateTime);
    
    originalISODateTime.value = rawDateTime;
    
    formData.value = {
      purpose: request.purpose,
      onsiteAt: formattedDateTime,
      address: request.address || request.location,
      status: request.status
    };
    
    originalData.value = { ...formData.value };
    
    if (request.items) {
      requestItems.value = request.items;
    }
    
    if (request.quote) {
      quoteInfo.value = request.quote;
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Failed to load request";
    console.error("Load request error:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.value.purpose) {
    errorMessage.value = "Keperluan harus dipilih";
    return;
  }
  if (!formData.value.onsiteAt) {
    errorMessage.value = "Tanggal onsite harus diisi";
    return;
  }
  if (!formData.value.address) {
    errorMessage.value = "Alamat harus diisi";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const updateData: any = {};
    
    if (formData.value.purpose !== originalData.value.purpose) {
      updateData.purpose = formData.value.purpose;
    }
    
    if (formData.value.onsiteAt !== originalData.value.onsiteAt) {
      const date = new Date(formData.value.onsiteAt);
      updateData.onsiteAt = date.toISOString();
    }
    
    if (formData.value.address !== originalData.value.address) {
      updateData.address = formData.value.address;
    }
    
    if (Object.keys(updateData).length > 0) {
      await apiClient.updateOnsiteRequest(id, updateData);
    }
    
    if (formData.value.status && formData.value.status !== originalData.value.status) {
      await apiClient.updateOnsiteRequestStatus(id, { status: formData.value.status });
    }
    
    successMessage.value = "Request berhasil diupdate!";
    
    setTimeout(() => {
      router.push("/request/list");
    }, 1500);
  } catch (error: any) {
    const errorData = error.response?.data;
    if (Array.isArray(errorData?.message)) {
      errorMessage.value = errorData.message.join(", ");
    } else {
      errorMessage.value = errorData?.message || "Gagal mengupdate request";
    }
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (newStatus: string) => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await apiClient.updateOnsiteRequestStatus(id, { status: newStatus });
    formData.value.status = newStatus;
    const statusLabel = statuses.find(s => s.value === newStatus)?.label || newStatus;
    successMessage.value = `Status berhasil diubah menjadi ${statusLabel}`;
  } catch (error: any) {
    const errorData = error.response?.data;
    if (Array.isArray(errorData?.message)) {
      errorMessage.value = errorData.message.join(", ");
    } else {
      errorMessage.value = errorData?.message || "Gagal mengubah status";
    }
    console.error("Status update error:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  router.push("/request/list");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadTimeline = async () => {
  try {
    await fetchTimeline(id);
  } catch (error) {
    console.error('Failed to load timeline:', error);
  }
};
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Request Onsite Edit</h1>
            <p class="text-sm text-gray-500 mt-1">
              Edit onsite requests in your system
            </p>
          </div>
          <div>
            <Breadcrumb />
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto flex flex-col">
        <div class="w-full px-6 py-8">
          <div class="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto">
            <!-- Loading State -->
            <div v-if="isLoading && !formData.purpose" class="text-center py-8">
              <p class="text-gray-500">Loading request data...</p>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- User Name (Read-only) -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  :value="userName"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-100"
                  disabled
                />
              </div>

              <!-- Purpose Dropdown -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
                <select
                  v-model="formData.purpose"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" disabled>Pilih keperluan</option>
                  <option
                    v-for="option in purposes"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Start Date -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Onsite</label>
                <input
                  v-model="formData.onsiteAt"
                  type="datetime-local"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <!-- Empty col for grid alignment -->
              <div class="mb-4"></div>

              <!-- Quote Information -->
              <div v-if="quoteInfo" class="mb-4 md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="font-medium text-gray-900 mb-3">Informasi Quote</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Nomor Quote</p>
                    <p class="text-sm font-medium text-gray-900">{{ quoteInfo.quoteNo }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Customer</p>
                    <p class="text-sm font-medium text-gray-900">{{ quoteInfo.customer?.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Telepon</p>
                    <p class="text-sm font-medium text-gray-900">{{ quoteInfo.customer?.phone || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Items Table -->
              <div v-if="requestItems.length > 0" class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Barang & Jumlah</label>
                <table class="w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Nama Barang</th>
                      <th class="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in requestItems" :key="index" class="hover:bg-gray-50">
                      <td class="px-4 py-2 border-b border-gray-300 text-sm text-gray-900">{{ item.name || item.itemName }}</td>
                      <td class="px-4 py-2 border-b border-gray-300 text-sm text-gray-900">{{ item.quantity || item.qty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Address -->
              <div class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea
                  v-model="formData.address"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Masukkan alamat lengkap lokasi onsite"
                ></textarea>
              </div>

              <!-- Status Section -->
              <div class="mb-4 md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label class="block text-sm font-medium text-gray-700 mb-3">Status Request</label>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="status in statuses"
                    :key="status.value"
                    @click="updateStatus(status.value)"
                    :class="[
                      'px-4 py-2 rounded-lg font-medium transition text-sm',
                      formData.status === status.value
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    ]"
                    type="button"
                    :disabled="isLoading"
                  >
                    {{ status.label }}
                  </button>
                </div>
              </div>

              <!-- Messages -->
              <div v-if="errorMessage" class="md:col-span-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="md:col-span-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                {{ successMessage }}
              </div>

              <!-- Buttons -->
              <div class="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  @click="handleCancel"
                  class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isLoading ? "Loading..." : "Update" }}
                </button>
              </div>
            </form>

            <!-- Timeline Section -->
            <div v-if="requestLogs.length > 0" class="mt-8 pt-8 border-t">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-gray-900">Activity Timeline</h2>
                <button
                  @click="showTimeline = !showTimeline"
                  class="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  {{ showTimeline ? 'Hide' : 'Show' }} Timeline
                </button>
              </div>

              <div v-if="showTimeline" class="space-y-4">
                <div
                  v-for="(log, index) in requestLogs"
                  :key="log.id"
                  class="flex gap-4"
                >
                  <!-- Timeline Dot and Line -->
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full bg-cyan-600 mt-2"></div>
                    <div
                      v-if="index < requestLogs.length - 1"
                      class="w-0.5 h-12 bg-gray-300 my-1"
                    ></div>
                  </div>

                  <!-- Timeline Content -->
                  <div class="pb-4 flex-1">
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <p class="font-semibold text-gray-900">{{ log.action }}</p>
                          <p class="text-sm text-gray-600 mt-1">{{ log.description }}</p>
                        </div>
                        <span class="text-xs text-gray-500">
                          {{ formatDate(log.timestamp) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 mt-3 text-xs">
                        <span class="text-gray-600">By:</span>
                        <span class="font-medium text-gray-900">{{ log.changedBy?.name }}</span>
                        <span class="text-gray-500">({{ log.changedBy?.email }})</span>
                      </div>

                      <!-- Status Change Info -->
                      <div
                        v-if="log.oldStatus || log.newStatus"
                        class="mt-3 text-xs bg-blue-50 p-2 rounded border border-blue-200"
                      >
                        <span class="text-gray-700">
                          Status:
                          <span class="font-medium text-gray-900">{{ log.oldStatus }}</span>
                          <span class="text-gray-600">→</span>
                          <span class="font-medium text-cyan-600">{{ log.newStatus }}</span>
                        </span>
                      </div>

                      <!-- Metadata -->
                      <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="mt-3">
                        <p class="text-xs text-gray-600 mb-1">Details:</p>
                        <div class="text-xs bg-white p-2 rounded border border-gray-200">
                          <div v-for="(value, key) in log.metadata" :key="key" class="text-gray-700">
                            <span class="font-medium">{{ key }}:</span>
                            <span class="text-gray-600">{{ value }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p class="text-gray-500">No activity logs yet</p>
              </div>
            </div>
            <div v-else class="mt-8 pt-8 border-t p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p class="text-gray-500">No activity logs available</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
