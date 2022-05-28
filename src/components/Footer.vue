<script setup>
import { ref, nextTick } from "vue";
import stream from "@/composables/stream";
import Calling from "@/components/Calling.vue";

const text = ref("");
const showRecordModal = ref(false);
const showCallingModal = ref(false);

const input = ref(null);
const image = ref(null);
const myself = ref(null);

const props = defineProps({
  disabled: Boolean,
});

const emit = defineEmits(["send"]);

function sendMessage() {
  if (!text.value) return;
  emit("send", text.value);
  text.value = "";
  input.value.focus();
}

function sendImage() {
  if (!image.value.files) return;
  const file = image.value.files[0];
  const blob = new Blob([file], { type: file.type });
  emit("send", blob);
  image.value.value = null;
}

async function openMediaStream() {
  showCallingModal.value = true;
  await nextTick();
  await stream.start();
}
</script>

<template>
  <div class="footer">
    <!-- First row (line input) -->
    <form @submit.prevent="sendMessage">
      <div class="row">
        <div class="col">
          <input ref="input" class="fill-width" v-model="text" />
        </div>
        <div class="col-auto">
          <button
            type="submit"
            :disabled="disabled"
            class="send-button color-primary"
          >
            Send
          </button>
        </div>
      </div>
    </form>

    <!-- Second row (buttons) -->
    <div class="row button-group" style="margin: 4px 0; text-align: center">
      <div class="col">
        <span class="mdi mdi-microphone"></span>
      </div>
      <div class="col">
        <span class="mdi mdi-image" @click="image.click()">
          <input ref="image" type="file" hidden @change="sendImage" />
        </span>
      </div>
      <div class="col">
        <span class="mdi mdi-video" @click="openMediaStream"></span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Calling v-model="showCallingModal"/>
  </Teleport>
</template>

<style>
.send-button {
  margin-left: 24px;
}

.button-group span.mdi {
  color: #999;
  cursor: pointer;
}

.button-group span.mdi:active {
  color: deepskyblue;
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
</style>
