<script setup lang="ts">
import { ref, watch } from "vue";
import stream, { myself, incomings } from "@/composables/stream";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const small = ref(false);
const muted = ref(false);
const cameraOff = ref(false);

function hangup() {
  stream.stop();
  for (const incoming of incomings.value)
    if ((incoming as any).connection) (incoming as any).connection.close();
  incomings.value = [];
  emit("update:modelValue", false);
}

watch(muted, () => {
  const tracks = stream.myself.value.getTracks();
  const audioTrack = tracks.filter((track) => track.kind === "audio")[0];
  audioTrack.enabled = !muted.value;
});

watch(cameraOff, () => {
  const tracks = stream.myself.value.getTracks();
  const videoTrack = tracks.filter((track) => track.kind === "video")[0];
  videoTrack.enabled = !cameraOff.value;
});

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
      <div class="flex-grow-1" />
      <template v-if="myself">
        <button class="btn-icon size-48">
          <span
            :class="['mdi', muted ? 'mdi-microphone-off' : 'mdi-microphone']"
            @click.stop="muted = !muted"
          ></span>
        </button>
        <button class="btn-icon size-48">
          <span
            :class="['mdi', cameraOff ? 'mdi-camera-off' : 'mdi-camera']"
            @click.stop="cameraOff = !cameraOff"
          ></span>
        </button>
      </template>
      <button class="btn-icon size-48">
        <span class="mdi mdi-resize" @click.stop="small = !small"></span>
      </button>
      <button class="hangup btn-icon size-48">
        <span class="mdi mdi-phone-hangup" @click="hangup"></span>
      </button>
      <div class="flex-grow-1" />
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
  display: flex;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
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
