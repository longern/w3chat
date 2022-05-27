<script setup>
import NativeShare from "nativeshare";

const props = defineProps({
  peerId: String,
  online: Number,
});

function share() {
  const nativeShare = new NativeShare();

  const url = new URL(location.href);
  url.searchParams.set("p", props.peerId);

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
      <div v-text="peerId || 'Connecting...'"></div>
      <div style="font-size: 8px"><span v-text="online"></span> online</div>
    </div>
    <div class="col-auto btn" @click="share">
      <span class="mdi mdi-share"></span>
    </div>
  </div>
</template>

<style>
.header > .btn {
  width: 48px;
}
</style>
