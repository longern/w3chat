import { ref } from "vue";

const events = new EventTarget();

export default {
  active: ref(false),
  selfStream: null,
  incomingStreams: [],

  start() {
    return navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.selfStream = stream;
        this.active.value = true;
        events.dispatchEvent(new CustomEvent("start", { detail: this.selfStream }));
        return stream;
      });
  },

  stop() {
    if (this.selfStream) {
      this.selfStream.getTracks().forEach((track) => track.stop());
      events.dispatchEvent(new CustomEvent("stop"));
      this.selfStream = null;
      this.active.value = false;
    }
  },

  on(event, callback) {
    events.addEventListener(event, callback);
  }
}
