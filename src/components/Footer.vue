<script setup>
import { ref } from "vue";

const text = ref("");
const input = ref(null);

const emit = defineEmits(["send"]);

function sendMessage() {
  if (!text.value) return;
  emit("send", text.value);
  text.value = "";
  input.value.focus();
}
</script>

<template>
  <div class="footer">
    <form @submit.prevent="sendMessage">
      <div class="row">
        <div class="col">
          <input ref="input" class="fill-width" v-model="text"/>
        </div>
        <div class="col-auto">
          <button
            type="submit"
            class="send-button color-primary"
          >
            Send
          </button>
        </div>
      </div>
    </form>
    <div class="row" style="margin-top: 0; text-align: center">
      <div class="col">
        <span class="mdi mdi-image"></span>
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
</style>
