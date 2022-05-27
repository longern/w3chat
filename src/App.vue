<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";

const peerId = ref("");
const messages = ref([]);

const peer = new Peer();
const connections = ref([]);

function onReceiveData(body) {
  if (body.type.startsWith("image/"))
    body.url = URL.createObjectURL(new Blob([body.data, { type: body.type }]));
  messages.value.push(body);
}

function onError(err) {
  messages.value.push({
    id: Math.random().toString(36).substr(2),
    type: "text/plain",
    from: "System",
    data: "Error: " + err.message,
    private: true,
  });
}

function handleConnection(connection) {
  connection.on("data", onReceiveData);
  connection.on("error", onError);
  connections.value.push(connection);
}

peer.on("open", function (id) {
  peerId.value = id;

  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch) handleConnection(peer.connect(peerIdMatch[1]));
});

peer.on("connection", handleConnection);
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
  <div
    class="header color-primary"
    v-text="connections.length + ' ' + peerId"
  ></div>
  <Main :messages="messages" />
  <Footer @send="sendMessage" />
</template>

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
  height: 1em;
}

.main {
  flex-grow: 1;
  overflow-y: auto;
}

.footer {
  padding: 8px 8px 0 8px;
}
</style>
