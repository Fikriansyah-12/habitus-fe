<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineOptions({ inheritAttrs: false });

type Props = {
  icon: string; // wajib
  width?: string | number;
  height?: string | number;
};

const props = defineProps<Props>();
</script>

<template>
  <Icon
    :icon="props.icon"
    :width="props.width"
    :height="props.height"
    v-bind="$attrs"
  />
</template>
