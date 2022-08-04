<script setup lang="ts">
import { ref, onActivated, onDeactivated } from "vue";

const emit = defineEmits(["record"]);

const recording = ref(false);
let audioStream: MediaStream = null;
let recorder: MediaRecorder = null;
let chunks: Blob[] = [];

onActivated(() => {
  navigator.mediaDevices
    .getUserMedia({
      audio: { echoCancellation: false },
      video: false,
    })
    .then((stream) => (audioStream = stream));
});

onDeactivated(() => {
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
    audioStream = null;
  }
});

function startRecord() {
  if (!audioStream) return;
  recording.value = true;
  recorder = new MediaRecorder(audioStream, { audioBitsPerSecond: 192000 });
  recorder.addEventListener("dataavailable", (event) => {
    chunks.push(event.data);
  });
  recorder.start();
  navigator.vibrate(30);
}

function endRecord() {
  if (!recorder || recorder.state === "inactive") return;
  recorder.addEventListener("stop", () => {
    const blob = new Blob(chunks, { type: recorder.mimeType });
    if (blob.size >= 4096) emit("record", blob);
    chunks = [];
  });
  recorder.stop();
  recording.value = false;
}
</script>

<template>
  <Transition name="from-bottom" appear>
    <div class="record row">
      <div style="margin: auto">
        <button
          :class="{ 'record-button': true, recording: recording }"
          @mousedown="startRecord"
          @mouseup="endRecord"
          @touchstart.prevent="startRecord"
          @touchend.prevent="endRecord"
        >
          <span class="mdi mdi-microphone"></span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style>
.record {
  height: 128px;
  overflow: hidden;
}

.from-bottom-enter-active,
.from-bottom-leave-active {
  transition: all 0.2s ease;
}

.from-bottom-leave-from,
.from-bottom-enter-to,
.from-bottom-leave {
  height: 128px;
}

.from-bottom-enter-from,
.from-bottom-enter,
.from-bottom-leave-to {
  height: 0;
}

.record-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #5fb1eb69;
  transition: transform 0.1s ease;
}

.record-button.recording {
  transform: scale(1.2);
}
</style>
