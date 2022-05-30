<script setup lang="ts">
import { inject, ref } from "vue";
import type { Ref } from 'vue';
import stream from "@/composables/stream";

const text = ref("");
const showRecordFooter = inject<Ref<boolean>>("showRecordFooter");
const showCallingModal = inject<Ref<boolean>>("showCallingModal");

const input = ref(null);
const image = ref(null);

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
  await stream.start();
  showCallingModal.value = true;
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
            <span>Send</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Second row (buttons) -->
    <div class="row button-group" style="margin: 4px 0; text-align: center">
      <div class="col">
        <button class="btn-text" @click="showRecordFooter = !showRecordFooter">
          <span class="mdi mdi-microphone"></span>
        </button>
      </div>
      <div class="col">
        <button class="btn-text" @click="image.click()">
          <span class="mdi mdi-image">
            <input ref="image" type="file" hidden @change="sendImage" />
          </span>
        </button>
      </div>
      <div class="col">
        <button class="btn-text" @click="openMediaStream">
          <span class="mdi mdi-video"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.send-button {
  margin-left: 24px;
  padding: 8px 12px;
}

.button-group span.mdi {
  color: #999;
  cursor: pointer;
}

.footer .btn-text {
  padding: 0 8px;
}

.footer .btn-text:active > span {
  color: deepskyblue;
}
</style>
