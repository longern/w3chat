<script setup>
import { ref } from "vue";

const text = ref("");
const input = ref(null);
const showRecordDialog = ref(false);
const image = ref(null);

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
</script>

<template>
  <div class="footer">
    <form @submit.prevent="sendMessage">
      <div class="row">
        <div class="col">
          <input ref="input" class="fill-width" v-model="text" />
        </div>
        <div class="col-auto">
          <button type="submit" class="send-button color-primary">Send</button>
        </div>
      </div>
    </form>
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
        <span class="mdi mdi-video"></span>
      </div>
    </div>
  </div>
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
</style>
