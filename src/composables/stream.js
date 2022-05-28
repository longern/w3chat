const events = new EventTarget();

export default {
  mediaStream: null,

  start() {
    return navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        events.dispatchEvent(new CustomEvent("start", { detail: this.mediaStream }));
        return stream;
      });
  },

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      events.dispatchEvent(new CustomEvent("stop"));
      this.mediaStream = null;
    }
  },

  on(event, callback) {
    events.addEventListener(event, callback);
  }
}
