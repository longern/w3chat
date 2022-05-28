<script setup>
import { ref } from "vue";
import NativeShare from "nativeshare";

const props = defineProps({
  peerId: String,
  online: Number,
});

const isWechat = ref(/micromessenger/i.test(navigator.userAgent));

function verbosePeerId(peerId) {
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
    <div class="col">
      <div v-text="verbosePeerId(peerId) || 'Connecting...'"></div>
      <div style="font-size: 8px"><span v-text="online"></span> online</div>
    </div>
    <div v-if="!isWechat" class="col-auto btn" @click="share">
      <span class="mdi mdi-share"></span>
    </div>
  </div>
</template>

<style>
.header > .btn {
  width: 48px;
}
</style>
