<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";
import { useI18n } from "vue-i18n";

import { profile, signKeypair } from "@/composables/state";
import { resizeImage } from "@/composables/utils";

const showSidebar = inject<Ref<boolean>>("showSidebar");
const { t } = useI18n({ inheritLocale: true });

async function uploadAvatar() {
  const avatarInput = <HTMLInputElement>(
    document.getElementById("upload-avatar")
  );
  if (!avatarInput.files) return;

  const imageFile = avatarInput.files[0];
  const imageBlob = new Blob([imageFile], { type: imageFile.type });
  const resizedImage = await resizeImage(imageBlob, { width: 96, height: 96 });

  // Convert resizedImage to data URL
  const reader = new FileReader();
  reader.readAsDataURL(resizedImage);
  const dataUrl: string = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(<string>reader.result);
    reader.onerror = reject;
  });

  profile.value.avatar = dataUrl;

  avatarInput.value = null;
}

async function changeNickname() {
  // Generate private key
  const { privateKey, publicKey } = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  signKeypair.value = {
    privateKey: await window.crypto.subtle.exportKey("jwk", privateKey),
    publicKey: await window.crypto.subtle.exportKey("jwk", publicKey),
  };
}
</script>

<template>
  <Transition name="from-left" appear>
    <div class="sidebar">
      <div class="row" style="padding: 32px 16px">
        <button class="close btn-text size-48" @click="showSidebar = false">
          <span class="mdi mdi-close"></span>
        </button>
        <button
          class="btn-icon rounded size-48 flex-shrink-0"
          onclick="this.nextElementSibling.click()"
        >
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            width="48"
            height="48"
          />
          <span v-else class="mdi mdi-account"></span>
        </button>
        <input
          id="upload-avatar"
          type="file"
          accept="image/*"
          hidden
          @change="uploadAvatar"
        />
        <input
          v-model="profile.nickname"
          :placeholder="t('Nickname...')"
          @change="changeNickname"
        />
      </div>
    </div>
  </Transition>
</template>

<style>
.sidebar {
  background-color: white;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 5;
}

.from-left-enter-active,
.from-left-leave-active {
  transition: all 0.2s ease;
}

.from-left-leave-from,
.from-left-enter-to,
.from-left-leave {
  left: 0;
}

.from-left-enter-from,
.from-left-enter,
.from-left-leave-to {
  left: -100%;
}

.sidebar button.close {
  position: absolute;
  top: 0;
  right: 0;
}

.sidebar input {
  font-size: 16px;
}
</style>

<i18n>
{
  "en": {
    "Nickname...": "Nickname..."
  },
  "zh-CN": {
    "Nickname...": "昵称..."
  }
}
</i18n>
