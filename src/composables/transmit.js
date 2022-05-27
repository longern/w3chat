import { ref, computed } from "vue";

export const peer = ref(null);
export const messages = ref([]);
const messagesIds = computed(() => new Set(messages.value.map((m) => m.id)));

peer.value = new Peer(Math.random().toString().slice(2, 11));
const connections = ref([]);
const connectedPeers = computed(
  () => new Set(connections.value.map((c) => c.peer))
);
const connectingPeers = new Set();

function onReceiveData(body) {
  if (body.type === "broadcast") {
    for (const pid of body.data)
      if (
        pid !== peer.value.id &&
        !connectedPeers.value.has(pid) &&
        !connectingPeers.has(pid) &&
        connections.value.length <= 32
      ) {
        connectingPeers.add(pid);
        handleConnection(peer.value.connect(pid));
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
      from: peer.value.id,
      data: [...connectedPeers.value],
    });
    for (const message of messages.value) {
      if (!message.private) this.send(message);
    }
  });
}

peer.value.on("open", function (id) {
  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch && connections.value.length <= 32) {
    connectingPeers.add(id);
    handleConnection(peer.value.connect(peerIdMatch[1]));
  }
  window.history.replaceState(null, null, `?p=${id}`);
});

peer.value.on("connection", handleConnection);
peer.value.on("disconnected", peer.value.reconnect);
peer.value.on("error", onError);
window.addEventListener("beforeunload", peer.value.destroy);

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

export function sendMessage(message) {
  let messageType = null;
  if (message instanceof Blob) messageType = message.type;
  else messageType = "text/plain";

  const messageBody = {
    id: Math.random().toString(36).substr(2),
    type: messageType,
    from: peer.value.id,
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
