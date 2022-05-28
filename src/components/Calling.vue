<script setup>
import { ref, watch } from "vue";
import stream from "@/composables/stream";

defineProps({ modelValue: Boolean });
defineEmits(["update:modelValue"]);

const myself = ref(null);

watch(stream.active, (active) => {
  if (myself.value && active) {
    myself.value.srcObject = stream.selfStream;
    myself.value.play();
  }
});
</script>

<template>
  <div v-if="modelValue" class="fullscreen-modal">
    <video
      ref="myself"
      muted
      class="position-absolute object-fit-cover"
      @click="
        $emit('update:modelValue', false);
        stream.stop();
      "
    ></video>
  </div>
</template>
