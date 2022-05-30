<script setup lang="ts">
import { inject, ref } from "vue";
import type { Ref } from 'vue';
import NativeShare from "nativeshare";

const props = defineProps({
  peerId: String,
  online: Number,
});

const isWechat = ref(/micromessenger/i.test(navigator.userAgent));
const showSidebar = inject<Ref<boolean>>("showSidebar");

function verbosePeerId(peerId: string) {
  if (!peerId) return "";
  return peerId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

function share() {
  const nativeShare = new NativeShare();

  const url = new URL(location.href);
  url.searchParams.set("p", props.peerId);
  url.searchParams.delete("m");

  nativeShare.setShareData({
    title: "W3Chat",
    desc: `${props.online}位好友正在邀请你聊天`,
    link: url.href,
  });
  nativeShare.call();
}
</script>

<template>
  <div class="header color-primary row">
    <button class="col-auto btn-text" @click="showSidebar = true">
      <span class="mdi mdi-account"></span>
    </button>
    <div class="col">
      <div class="row flex-column fill-height">
        <div class="flex-grow-1"></div>
        <div v-text="verbosePeerId(peerId) || 'Connecting...'"></div>
        <div style="font-size: 8px"><span v-text="online"></span> online</div>
        <div class="flex-grow-1"></div>
      </div>
    </div>
    <button v-visible="!isWechat" class="col-auto btn-text" @click="share">
      <span class="mdi mdi-share"></span>
    </button>
  </div>
</template>

<style>
.header {
  text-align: center;
}

.header > button {
  width: 48px;
  height: 48px;
  color: white;
}
</style>
