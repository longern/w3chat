<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, computed } from "vue";
import Header from "./components/Header.vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";

const peerId = ref("");
const messages = ref([]);
const messagesIds = computed(() => new Set(messages.value.map((m) => m.id)));

const peer = new Peer(Math.random().toString().slice(2, 11));
const connections = ref([]);
const connectedPeers = computed(
  () => new Set(connections.value.map((c) => c.peer))
);
const connectingPeers = new Set();

function onReceiveData(body) {
  if (body.type === "broadcast") {
    for (const pid of body.data)
      if (
        pid !== peerId.value &&
        !connectedPeers.value.has(pid) &&
        !connectingPeers.has(pid) &&
        connections.value.length <= 32
      ) {
        connectingPeers.add(pid);
        handleConnection(peer.connect(pid));
      }
    return;
  }

  if (body.type.startsWith("image/"))
    body.url = URL.createObjectURL(new Blob([body.data], { type: body.type }));
  if (!messagesIds.value.has(body.id)) messages.value.push(body);
}

function onError(err) {
  messages.value.push({
    id: Math.random().toString(36).substr(2),
    type: "text/plain",
    from: "System",
    data: "Error: " + err.message,
    timestamp: Date.now(),
    private: true,
  });
}

function handleConnection(connection) {
  connection.on("data", onReceiveData);
  connection.on("error", onError);
  connection.on("open", function () {
    connections.value.push(this);
    connectingPeers.delete(this.peer);
    this.send({
      type: "broadcast",
      from: peerId.value,
      data: [...connectedPeers.value],
    });
    for (const message of messages.value) {
      if (!message.private) this.send(message);
    }
  });
}

peer.on("open", function (id) {
  peerId.value = id;

  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch && connections.value.length <= 32) {
    connectingPeers.add(id);
    handleConnection(peer.connect(peerIdMatch[1]));
  }
  window.history.replaceState(null, null, `?p=${id}`);
});

peer.on("connection", handleConnection);
peer.on("disconnected", peer.reconnect);
peer.on("error", onError);
window.addEventListener("beforeunload", peer.destroy);

function removeClosedConnections() {
  for (let i = 0; i < connections.value.length; i++) {
    const connection = connections.value[i];
    if (!connection.open) {
      connections.value.splice(i, 1);
      i--;
    }
  }
}

setInterval(removeClosedConnections, 3000);

function sendMessage(message) {
  let messageType = null;
  if (message instanceof Blob) messageType = message.type;
  else messageType = "text/plain";

  const messageBody = {
    id: Math.random().toString(36).substr(2),
    type: messageType,
    from: peerId.value,
    data: message,
    timestamp: Date.now(),
  };
  removeClosedConnections();
  for (let conn of connections.value) {
    conn.send(messageBody);
  }
  if (messageType.startsWith("image/"))
    messageBody.url = URL.createObjectURL(messageBody.data);
  messages.value.push(messageBody);
}
</script>

<template>
  <Header :peer-id="peerId" :online="connections.length + 1" />
  <Main :messages="messages" />
  <Footer :disabled="peerId === ''" @send="sendMessage" />
</template>import NativeShare from 'nativeshare'

<style>
@import "main.css";

#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: whitesmoke;
}

.header {
  padding: 16px 0;
  text-align: center;
  height: 1.5em;
}

.main {
  flex-grow: 1;
  overflow-y: auto;
}

.footer {
  padding: 8px 8px 0 8px;
}
</style>
