<script setup>
import { ref } from "vue";
import stream, { myself, incomings } from "@/composables/stream";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const small = ref(false);

function hangup() {
  stream.stop();
  for (const incoming of incomings.value)
    if (incoming.connection) incoming.connection.close();
  incomings.value = [];
  emit("update:modelValue", false);
}

stream.on("remove", () => {
  if (!myself.value || !incomings.value.length)
    emit("update:modelValue", false);
});
</script>

<template>
  <div
    v-if="modelValue"
    :class="small ? 'smallscreen-modal' : 'fullscreen-modal'"
    @click="small = false"
  >
    <template v-if="myself">
      <video muted autoplay :srcObject.prop="myself"></video>
    </template>
    <template v-if="incomings.length">
      <video
        v-for="st in incomings"
        :key="st.id"
        autoplay
        :srcObject.prop="st"
        class="incomings"
      ></video>
    </template>
    <div v-if="!small" class="calling-buttons">
      <button class="btn-icon">
        <span class="mdi mdi-resize" @click.stop="small = !small"></span>
      </button>
      <button class="btn-icon hangup">
        <span class="mdi mdi-phone-hangup" @click="hangup"></span>
      </button>
    </div>
  </div>
</template>

<style>
.smallscreen-modal {
  position: absolute;
  top: 5%;
  right: 5%;
  z-index: 100;
  overflow: hidden;
}

.smallscreen-modal > video {
  float: right;
  max-width: 40%;
  max-height: 40%;
}

.fullscreen-modal {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  overflow: auto;
}

.fullscreen-modal > video {
  position: absolute;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.calling-buttons {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  text-align: center;
}

.calling-buttons > button {
  background: #ffffff40;
  backdrop-filter: blur(2px);
  margin: 0 8px;
}

.calling-buttons > button.hangup {
  background-color: #df3d3d;
  color: white;
}
</style>
