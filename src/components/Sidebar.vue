<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from 'vue';

const showSidebar = inject<Ref<boolean>>("showSidebar");
</script>

<template>
  <Transition name="from-left" appear>
    <div class="sidebar">
      <button class="btn-text" @click="showSidebar = false">
        <span class="mdi mdi-close"></span>
      </button>
    </div>
  </Transition>
</template>

<style>
.sidebar {
  background-color: white;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.from-left-enter-active,
.from-left-leave-active {
  transition: all 0.2s ease;
}

.from-left-leave-from,
.from-left-enter-to,
.from-left-leave {
  left: 0;
}

.from-left-enter-from,
.from-left-enter,
.from-left-leave-to {
  left: -100%;
}

</style>
