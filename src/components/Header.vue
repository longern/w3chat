<script setup lang="ts">
import { computed, inject, ref } from "vue";
import type { Ref } from "vue";
import { useI18n } from "vue-i18n";
import NativeShare from "nativeshare";

import { profile } from "@/composables/state";
import { peer } from "@/composables/transmit";

const isWechat = ref(/micromessenger/i.test(navigator.userAgent));
const showSidebar = inject<Ref<boolean>>("showSidebar");
const { t } = useI18n({ inheritLocale: true });

function verbosePeerId(peerId: string) {
  if (!peerId) return "";
  return peerId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const onlineNumber = computed(() => {
  const isAnyOpen = (conns) =>
    conns.some((conn) => conn.open && conn.type === "data");
  return Object.values(peer.value.connections).filter(isAnyOpen).length + 1;
});

function share() {
  const nativeShare = new NativeShare();

  const url = new URL(location.href);
  url.searchParams.set("p", peer.value.id);
  url.searchParams.delete("m");

  nativeShare.setShareData({
    title: "W3Chat",
    desc: t("invitation", { onlineNumber: onlineNumber.value }),
    link: url.href,
  });
  nativeShare.call();
}
</script>

<template>
  <div class="header color-primary row">
    <button
      aria-label="Toggle sidebar"
      class="col-auto btn-icon rounded size-48"
      @click="showSidebar = true"
    >
      <img
        v-if="profile.avatar"
        :src="profile.avatar"
        alt="avatar"
        width="48"
        height="48"
      />
      <span v-else class="mdi mdi-account"></span>
    </button>
    <div class="col">
      <div class="row flex-column fill-height">
        <div class="flex-grow-1"></div>
        <div v-text="verbosePeerId(peer.id) || t('Connecting...')"></div>
        <div style="font-size: 8px">
          <span
            v-text="t('%{onlineNumber} online', { onlineNumber: onlineNumber })"
          ></span>
        </div>
        <div class="flex-grow-1"></div>
      </div>
    </div>
    <button
      v-visible="!isWechat"
      aria-label="Share"
      class="col-auto btn-icon size-48"
      @click="share"
    >
      <span class="mdi mdi-share"></span>
    </button>
  </div>
</template>

<style>
.header {
  text-align: center;
  padding: 8px;
}

.header > button {
  color: white;
  background: none;
}
</style>

<i18n>
{
  "en": {
    "%{onlineNumber} online": "%{onlineNumber} online",
    "Connecting...": "Connecting...",
    "invitation": "%{onlineNumber} friends are online. Click to join."
  },
  "zh-CN": {
    "%{onlineNumber} online": "%{onlineNumber} 人在线",
    "Connecting...": "连接中...",
    "invitation": "%{onlineNumber} 位好友正在聊天，点击加入。"
  }
}
</i18n>
