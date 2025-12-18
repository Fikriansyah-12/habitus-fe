<script setup lang="ts">
import Breadcrumb from "@/components/Breadcrumb.vue";
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { apiClient } from "@/utils/api";
import { StorageService } from "@/utils/storage";
import type { CreateOnsiteRequestDto, QuoteDto } from "@/types";

const router = useRouter();
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const getMinimumDate = (): string => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 2);
  
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, '0');
  const date = String(minDate.getDate()).padStart(2, '0');
  const hours = String(minDate.getHours()).padStart(2, '0');
  const minutes = String(minDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

const minimumDate = computed(() => getMinimumDate());

const formData = ref<CreateOnsiteRequestDto>({
  purpose: "",
  onsiteAt: "",
  address: "",
  quoteId: "",
  items: []
});

const userName = ref("");
const quotes = ref<QuoteDto[]>([]);
const selectedQuote = ref<QuoteDto | null>(null);
const selectedQuoteId = ref("");

const purposes = [
  { label: "Pengiriman Barang", value: "PENGIRIMAN_BARANG" },
  { label: "Meeting", value: "MEETING" },
  { label: "Survey", value: "SURVEY" },
  { label: "Dokumentasi", value: "DOKUMENTASI" },
];

onMounted(async () => {
  const user = StorageService.getUser();
  if (user) {
    userName.value = user.name;
  }
  
  await loadQuotes();
});

const loadQuotes = async () => {
  try {
    const data = await apiClient.getQuotes();
    quotes.value = data || []
  } catch (error: any) {
    console.error("Failed to load quotes:", error);
    errorMessage.value = `Failed to load quotes: ${error.response?.data?.message || error.message}`
    quotes.value = []
  }
};

watch(() => selectedQuoteId.value, async (quoteId) => {
  if (quoteId) {
    try {
      const quote = quotes.value.find(q => q.id === quoteId);
      if (!quote) {
        console.error("Quote not found in list");
        selectedQuote.value = null;
        formData.value.items = [];
        formData.value.quoteId = "";
        return;
      }

      selectedQuote.value = quote;
      formData.value.quoteId = quoteId;
      
      if (quote.items && quote.items.length > 0) {
        formData.value.items = quote.items.map((item: any) => ({
          name: item.name,
          qty: item.qty
        }));
      } else if (quote.itemName && quote.quantity) {
        formData.value.items = [{
          name: quote.itemName,
          qty: quote.quantity
        }];
      } else {
        formData.value.items = [];
      }
    } catch (error: any) {
      console.error("Failed to load quote details:", error);
      errorMessage.value = `Failed to load quote details: ${error.response?.data?.message || error.message}`
      selectedQuote.value = null;
      formData.value.items = [];
      formData.value.quoteId = "";
    }
  } else {
    selectedQuote.value = null;
    formData.value.items = [];
    formData.value.quoteId = "";
  }
});

const handleSubmit = async () => {
  if (!formData.value.purpose) {
    errorMessage.value = "Keperluan harus dipilih";
    return;
  }
  if (!formData.value.onsiteAt) {
    errorMessage.value = "Tanggal onsite harus diisi";
    return;
  }
  
  const onsiteDateTime = new Date(formData.value.onsiteAt);
  const now = new Date();
  const minDateTime = new Date(now);
  minDateTime.setDate(minDateTime.getDate() + 2);
  
  if (onsiteDateTime < minDateTime) {
    errorMessage.value = "Tanggal Onsite minimal H+2 dari tanggal sekarang";
    return;
  }
  
  if (!formData.value.address) {
    errorMessage.value = "Alamat harus diisi";
    return;
  }
  if (!formData.value.quoteId) {
    errorMessage.value = "Quote harus dipilih";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload: CreateOnsiteRequestDto = {
      purpose: formData.value.purpose,
      onsiteAt: new Date(formData.value.onsiteAt).toISOString(),
      address: formData.value.address,
      quoteId: formData.value.quoteId,
      items: formData.value.items && formData.value.items.length > 0 ? formData.value.items : []
    };
    await apiClient.createOnsiteRequest(payload);

    successMessage.value = "Request berhasil dibuat!";
    
    setTimeout(() => {
      router.push("/request/list");
    }, 1500);
  } catch (error: any) {
    const errorData = error.response?.data;
    
    if (Array.isArray(errorData?.message)) {
      errorMessage.value = errorData.message.join(", ");
    } else {
      errorMessage.value = errorData?.message || "Gagal membuat request";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleReset = () => {
  formData.value = {
    purpose: "",
    onsiteAt: "",
    address: "",
    quoteId: "",
    items: []
  };
  selectedQuoteId.value = "";
  errorMessage.value = "";
};
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white shadow-sm sticky top-0 z-40">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Request Onsite New</h1>
            <p class="text-sm text-gray-500 mt-1">
              New onsite requests in your system
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
            <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Onsite <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.onsiteAt"
                  type="datetime-local"
                  :min="minimumDate"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p class="text-xs text-gray-500 mt-1">Minimal H+2 dari tanggal pengajuan</p>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Quote No <span class="text-red-500">*</span></label>
                <select
                  v-model="selectedQuoteId"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" disabled>Pilih Quote No</option>
                  <option
                    v-for="quote in quotes"
                    :key="quote.id"
                    :value="quote.id"
                  >
                    {{ quote.quoteNo }}
                  </option>
                </select>
              </div>

              <!-- Items Table -->
              <div v-if="formData.items && formData.items.length > 0" class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Barang & Jumlah</label>
                <table class="w-full border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Nama Barang</th>
                      <th class="px-4 py-2 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in formData.items" :key="index" class="hover:bg-gray-50">
                      <td class="px-4 py-2 border-b border-gray-300 text-sm text-gray-900">{{ item.name }}</td>
                      <td class="px-4 py-2 border-b border-gray-300 text-sm text-gray-900">{{ item.qty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Customer Info -->
              <div v-if="selectedQuote" class="mb-4 md:col-span-2 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-medium text-gray-900 mb-2">Informasi Customer</h3>
                <p class="text-sm text-gray-700"><strong>Nama:</strong> {{ selectedQuote.customerName }}</p>
                <p class="text-sm text-gray-700"><strong>Telepon:</strong> {{ selectedQuote.customerPhone }}</p>
              </div>

              <!-- Address -->
              <div class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap <span class="text-red-500">*</span></label>
                <textarea
                  v-model="formData.address"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Masukkan alamat lengkap lokasi onsite"
                ></textarea>
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
                  type="reset"
                  @click="handleReset"
                  class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isLoading ? "Loading..." : "Submit" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
