<script setup>
import stream from "@/composables/stream";

defineProps({ modelValue: Boolean });
defineEmits(["update:modelValue"]);
</script>

<template>
  <div v-if="modelValue" class="fullscreen-modal">
    <video
      v-if="stream.active"
      ref="myself"
      muted
      autoplay
      :srcObject.prop="stream.selfStream"
      class="position-absolute object-fit-cover"
    ></video>
    <video
      v-for="st in stream.incomingStreams"
      :key="st.id"
      autoplay
      :srcObject.prop="st"
      class="incomings position-absolute object-fit-cover"
    ></video>
    <div class="calling-buttons">
      <button class="btn-icon hangup">
        <span
          class="mdi mdi-phone-hangup"
          @click="
            $emit('update:modelValue', false);
            stream.stop();
          "
        ></span>
      </button>
    </div>
  </div>
</template>

<style>
.calling-buttons {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  text-align: center;
}

.hangup {
  background-color: #df3d3d;
  color: white;
}
</style>
