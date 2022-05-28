<script setup>
import stream, { myself, incomings } from "@/composables/stream";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

function hangup() {
  stream.stop();
  for (const incoming of incomings.value)
    if (incoming.connection)
      incoming.connection.close();
  incomings.value = [];
  emit('update:modelValue', false);
}

stream.on("remove", () => {
  if (!myself.value || !incomings.value.length)
    emit('update:modelValue', false);
});
</script>

<template>
  <div v-if="modelValue" class="fullscreen-modal">
    <template v-if="myself">
      <video
        muted
        autoplay
        :srcObject.prop="myself"
        class="position-absolute object-fit-cover"
      ></video>
    </template>
    <template v-if="incomings.length">
      <video
        v-for="st in incomings"
        :key="st.id"
        autoplay
        :srcObject.prop="st"
        class="incomings position-absolute object-fit-cover"
      ></video>
    </template>
    <div class="calling-buttons">
      <button class="btn-icon hangup">
        <span
          class="mdi mdi-phone-hangup"
          @click="hangup"
        ></span>
      </button>
    </div>
  </div>
</template>

<style>
.calling-buttons {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px 0;
  text-align: center;
}

.hangup {
  background-color: #df3d3d;
  color: white;
}
</style>
