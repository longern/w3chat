import { ref } from "vue";

const events = new EventTarget();

export const myself = ref<MediaStream>(null);
export const incomings = ref<MediaStream[]>([]);

let myselfLock = false;

export default {
  myself,
  incomings,

  async start() {
    if (myself.value) return;
    myselfLock = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      myself.value = stream;
      events.dispatchEvent(new CustomEvent("start", { detail: myself.value }));
    } finally {
      myselfLock = false;
    }
  },

  stop() {
    if (myself.value) {
      myself.value.getTracks().forEach((track) => track.stop());
      events.dispatchEvent(new CustomEvent("end", { detail: myself.value.id }));
      myself.value = null;
    }
  },

  addIncoming(stream: MediaStream) {
    const streamIds = incomings.value.map((s) => s.id);
    if (streamIds.includes(stream.id)) return;
    incomings.value.push(stream);
    events.dispatchEvent(new CustomEvent("incoming", { detail: stream }));
  },

  removeIncoming(streamId: string) {
    const index = incomings.value.findIndex((s) => s.id === streamId);
    if (index === -1) return;
    incomings.value.splice(index, 1);
    events.dispatchEvent(new CustomEvent("remove", { detail: streamId }));
  },

  on(event: string, callback: { (evt: CustomEvent): void }) {
    events.addEventListener(event, callback as EventListener);
  },
};
