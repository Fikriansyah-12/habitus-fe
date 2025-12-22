<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Button from "../../components/Button.vue";
import { apiClient } from "../../utils/api";
import { StorageService } from "../../utils/storage";
import bg from "@/assets/image/bg.jpeg";
import logo from "@/assets/logo/logo.png";

const router = useRouter();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

// Load saved email and rememberMe preference on mount
onMounted(() => {
  const savedEmail = localStorage.getItem('rememberedEmail');
  const savedRemember = localStorage.getItem('rememberMe') === 'true';
  
  if (savedEmail && savedRemember) {
    email.value = savedEmail;
    rememberMe.value = true;
  }
});

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await apiClient.login({
      email: email.value,
      password: password.value
    });

    if (!response.token || response.token === 'undefined') {
      throw new Error('Login response missing valid token');
    }

    // Handle "Remember Me"
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Clear saved email if unchecked
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }

    StorageService.setUser(response.user);
    StorageService.setToken(response.token);
    StorageService.setEmail(response.user.email);

    console.log('✓ Data saved to localStorage');
    console.log('Stored Token:', localStorage.getItem('authToken')?.substring(0, 20) + '...');
    console.log('Stored User:', localStorage.getItem('user'));

    email.value = "";
    password.value = "";
    rememberMe.value = false;

    console.log('Redirecting to /dashboard...');
    router.push("/dashboard");
  } catch (error: any) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error('✗ Login error:', { statusCode, message, error });
    
    if (statusCode === 401) {
      errorMessage.value = "Invalid email or password";
    } else if (message.includes('missing')) {
      errorMessage.value = "Backend error: Login response is incomplete. Check backend API.";
    } else if (!message || message.includes('Network')) {
      errorMessage.value = "Network error. Please check your connection and backend server.";
    } else {
      errorMessage.value = message || "Login failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Login Form -->

  <div class="hidden lg:flex items-center justify-center flex-1">
    <div
      class="flex items-center justify-center w-full h-screen bg-cover bg-center"
      :style="{ backgroundImage: `url(${bg})` }"
    >

      <img :src="logo" alt="logo" class="w-1/2 h-auto " />
    </div>
  </div>
    <!-- Right Side - Login Form -->
    <div class="flex-1 bg-whiteAccent flex items-center justify-center">
      <div class="w-full p-8 rounded-lg shadow max-w-md">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login to Your Account
        </h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Email Address</label
            >
            <input
              v-model="email"
              type="email"
              id="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
              >Password</label
            >
            <input
              v-model="password"
              type="password"
              id="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                v-model="rememberMe"
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700"
                >Remember me</label
              >
            </div>
            <a
              href="#"
              class="text-sm font-medium text-blackAccent "
              >Forgot password?</a
            >
          </div>
          <div v-if="errorMessage" class="text-red-600 text-sm bg-red-50 p-3 rounded">
            {{ errorMessage }}
          </div>
          <Button type="submit" :loading="isLoading" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
