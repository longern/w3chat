import { ref } from "vue";

const events = new EventTarget();

export const myself = ref(null);
export const incomings = ref([]);

export default {
  myself,
  incomings,

  start() {
    return navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myself.value = stream;
        events.dispatchEvent(new CustomEvent("start", { detail: myself.value }));
        return stream;
      });
  },

  stop() {
    if (myself.value) {
      myself.value.getTracks().forEach((track) => track.stop());
      events.dispatchEvent(new CustomEvent("end", { detail: myself.value.id }));
      myself.value = null;
    }
  },

  addIncoming(stream) {
    const streamIds = incomings.value.map((s) => s.id);
    if (streamIds.includes(stream.id)) return;
    incomings.value.push(stream);
    events.dispatchEvent(new CustomEvent("incoming", { detail: stream }));
  },

  removeIncoming(streamId) {
    const index = incomings.value.findIndex((s) => s.id === streamId);
    if (index === -1) return;
    incomings.value.splice(index, 1);
    events.dispatchEvent(new CustomEvent("remove", { detail: streamId }));
  },

  on(event, callback) {
    events.addEventListener(event, callback);
  }
}
