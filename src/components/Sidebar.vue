<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";

import { profile } from "@/composables/state";
import { resizeImage } from "@/composables/utils";

const showSidebar = inject<Ref<boolean>>("showSidebar");

async function uploadAvatar() {
  const avatarInput = <HTMLInputElement>(
    document.getElementById("upload-avatar")
  );
  if (!avatarInput.files) return;

  const imageFile = avatarInput.files[0];
  const imageBlob = new Blob([imageFile], { type: imageFile.type });
  const resizedImage = await resizeImage(imageBlob, { width: 48, height: 48 });

  // Convert resizedImage to data URL
  const reader = new FileReader();
  reader.readAsDataURL(resizedImage);
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  profile.value.avatar = dataUrl;

  avatarInput.value = null;
}
</script>

<template>
  <Transition name="from-left" appear>
    <div class="sidebar">
      <div class="row" style="padding: 32px 16px">
        <button class="close btn-text size-48" @click="showSidebar = false">
          <span class="mdi mdi-close"></span>
        </button>
        <button class="btn-icon rounded size-48 flex-shrink-0" onclick="this.nextElementSibling.click()">
          <img v-if="profile.avatar" :src="profile.avatar" />
          <span v-else class="mdi mdi-account"></span>
        </button>
        <input
          id="upload-avatar"
          type="file"
          accept="image/*"
          hidden
          @change="uploadAvatar"
        />
        <input v-model="profile.nickname" placeholder="Nickname..."/>
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
