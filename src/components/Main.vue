<script setup>
const props = defineProps({
  messages: Array,
});
</script>

<template>
  <div class="main">
    <div class="row" v-for="(message, i) in messages" :key="i">
      <div class="col-auto">
        <div class="avatar rounded">
          <span class="mdi mdi-account"></span>
        </div>
      </div>
      <div class="col">
        <div class="from" v-text="message.from"></div>
        <div class="fill-width">
          <span
            v-if="message.type === 'text/plain'"
            class="message"
            v-text="message.data"
          ></span>
          <a
            v-else-if="message.type.startsWith('image/')"
            :href="message.url"
            target="_blank"
          >
            <img class="message" :src="message.url" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.main {
  padding: 8px;
}

.message {
  max-width: 100%;
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
  max-height: 30vh;
}

.from {
  font-size: 14px;
  color: #999;
  margin-bottom: 2px;
}

.avatar {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  background: white;
  text-align: center;
}

.avatar > span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
