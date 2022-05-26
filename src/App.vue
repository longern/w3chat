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

async function onReceiveData(body) {
  if (body.type.startsWith("image/"))
    body.data = URL.createObjectURL(new Blob([body.data, { type: body.type }]));
  messages.value.push(body);
}

peer.on("open", function (id) {
  peerId.value = id;

  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch) {
    const peerId = peerIdMatch[1];
    const conn = peer.connect(peerId);
    conn.on("open", function () {
      conn.on("data", onReceiveData);
      connections.value.push(conn);
    });
  }
});

peer.on("connection", function (conn) {
  conn.on("data", onReceiveData);
  connections.value.push(conn);
});

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
  for (let conn of connections.value) {
    conn.send(messageBody);
  }
  if (messageType.startsWith("image/"))
    messageBody.data = URL.createObjectURL(messageBody.data);
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
