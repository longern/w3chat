<script setup lang="ts">
import { ref } from "vue";
import stream, { myself, incomings } from "@/composables/stream";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const small = ref(false);

function hangup() {
  stream.stop();
  for (const incoming of incomings.value)
    if ((incoming as any).connection) (incoming as any).connection.close();
  incomings.value = [];
  emit("update:modelValue", false);
}

stream.on("remove", () => {
  if (!myself.value && !incomings.value.length)
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
      <video
        muted
        autoplay
        :srcObject.prop="myself"
        :class="{ 'secondary-video': incomings.length }"
      ></video>
    </template>
    <template v-if="incomings.length">
      <video
        v-for="st in incomings"
        :key="st.id"
        autoplay
        controls
        controlslist="nodownload nofullscreen noremoteplayback"
        disablepictureinpicture
        :srcObject.prop="st"
        class="incomings"
        onplay="this.removeAttribute('controls')"
      ></video>
    </template>
    <div v-if="!small" class="calling-buttons">
      <button class="btn-icon size-48">
        <span class="mdi mdi-resize" @click.stop="small = !small"></span>
      </button>
      <button class="hangup btn-icon size-48">
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
  width: 30%;
  height: 30%;
  z-index: 100;
  overflow: hidden;
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

.smallscreen-modal > video,
.fullscreen-modal > video {
  position: absolute;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.smallscreen-modal > .secondary-video {
  display: none;
}

.fullscreen-modal > .secondary-video {
  top: 5%;
  right: 5%;
  width: 30%;
  height: 30%;
  z-index: 1;
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
