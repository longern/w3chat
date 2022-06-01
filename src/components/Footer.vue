<script setup lang="ts">
import { inject, ref } from "vue";
import type { Ref } from "vue";
import { useI18n } from "vue-i18n";

import stream from "@/composables/stream";
import { peer } from "@/composables/transmit";

const text = ref("");
const showRecordPanel = inject<Ref<boolean>>("showRecordPanel");
const showCallingModal = inject<Ref<boolean>>("showCallingModal");

const input = ref(null);
const image = ref(null);
const { t } = useI18n({ inheritLocale: true });

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
        <div class="col inline-flex">
          <input
            ref="input"
            class="fill-width"
            v-model="text"
            aria-labelledby="message"
          />
        </div>
        <div class="col-auto">
          <button
            type="submit"
            aria-label="Send message"
            :disabled="!peer.open"
            class="send-button color-primary"
          >
            <span>{{ t("Send") }}</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Second row (buttons) -->
    <div class="row button-group" style="margin: 4px 0; text-align: center">
      <div class="col">
        <button
          aria-label="Show record panel"
          class="btn-text"
          @click="showRecordPanel = !showRecordPanel"
        >
          <span class="mdi mdi-microphone"></span>
        </button>
      </div>
      <div class="col">
        <button aria-label="Send image" class="btn-text" @click="image.click()">
          <span class="mdi mdi-image">
            <input ref="image" type="file" hidden @change="sendImage" />
          </span>
        </button>
      </div>
      <div class="col">
        <button
          aria-label="Video chat"
          class="btn-text"
          @click="openMediaStream"
        >
          <span class="mdi mdi-video"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.send-button {
  margin-left: 8px;
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

<i18n>
{
  "en": {
    "Send": "Send"
  },
  "zh-CN": {
    "Send": "发送"
  }
}
</i18n>
