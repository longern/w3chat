<script setup lang="ts">
import { onBeforeUpdate, onUpdated, ref, watch } from "vue";

import { blobPool, peer } from "@/composables/transmit";
import { users } from "@/composables/state";

defineProps<{ messages: Array<Record<string, any>> }>();

const main = ref(null);
const cachedPeerId = ref(null);

watch(peer, (peer) => {
  if (peer.open) cachedPeerId.value = peer.id;
});

let scrollToBottom = false;

onBeforeUpdate(() => {
  if (
    main.value.scrollTop + main.value.clientHeight >=
    main.value.scrollHeight - 16
  )
    scrollToBottom = true;
});

onUpdated(() => {
  if (scrollToBottom) {
    main.value.scrollTop = main.value.scrollHeight;
    scrollToBottom = false;
  }
});
</script>

<template>
  <div ref="main" class="main">
    <div
      class="row"
      v-for="(message, i) in messages"
      :key="i"
      :class="{ myself: message.from === cachedPeerId }"
    >
      <template v-if="message.from === 'System'">
        <div class="col system-message" v-text="message.data"></div>
      </template>
      <template v-else>
        <div class="col-auto">
          <button class="btn-icon size-32 avatar rounded">
            <img
              v-if="(users[message.from] || {}).avatar"
              :src="users[message.from].avatar"
              class="fill-width"
            />
            <span v-else class="mdi mdi-account"></span>
          </button>
        </div>
        <div class="col">
          <div class="from">
            <span
              v-text="
                (users[message.from] || {}).nickname || message.from || 'I'
              "
            ></span>
          </div>
          <div class="fill-width">
            <span
              v-if="message.type === 'text/plain'"
              class="message"
              v-text="message.data"
            ></span>
            <a
              v-else-if="message.type.startsWith('image/')"
              :href="blobPool[message.digest].url || message.url"
              target="_blank"
            >
              <img class="message" :src="message.url" />
            </a>
            <template v-else-if="message.type.startsWith('audio/')">
              <audio v-if="blobPool[message.digest].url" controls>
                <source :src="blobPool[message.digest].url" />
              </audio>
              <audio v-else controls />
            </template>
            <span
              v-if="message.digest && !blobPool[message.digest].url"
              class="mdi mdi-spin mdi-loading"
            ></span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.main {
  padding: 8px;
}

.myself {
  flex-direction: row-reverse;
  text-align: right;
}

.myself .avatar {
  margin-left: 8px;
  margin-right: 0;
}

.message {
  max-width: 100%;
}

.system-message {
  font-size: 8px;
  text-align: center;
}

span.message {
  background-color: white;
  padding: 8px 12px;
  border-radius: 16px;
  display: inline-block;
  word-break: break-word;
  min-width: 1em;
}

img.message {
  background-color: white;
  border-radius: 4px;
  display: inline-block;
  max-height: 8em;
}

.from {
  font-size: 14px;
  color: #999;
  margin-bottom: 2px;
}

button.avatar {
  margin-right: 8px;
  background-color: white;
}
</style>
