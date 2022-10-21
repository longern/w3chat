<script setup lang="ts">
import { inject } from "vue";
import { streaming, joinStream } from "@/composables/transmit";

const showCallingModal = inject("showCallingModal");
</script>

<template>
  <div
    v-if="streaming.length && !showCallingModal"
    class="banner"
    @click="
      joinStream();
      showCallingModal = true;
    "
  >
    <div id="banner" class="banner--wrap">
      <span v-if="streaming.length === 1">
        {{ streaming[0] }}
      </span>
      <span v-else>{{ streaming.length }} members</span>
      <span> is streaming. Click to join.</span>
    </div>
  </div>
</template>

<style>
.banner {
  position: relative;
  z-index: 1;
}

.banner--wrap {
  background: #5fb1eb69;
  backdrop-filter: blur(8px);
  position: absolute;
  width: 100%;
  padding: 4px 0;
  text-align: center;
}
</style>
