import { ref } from "vue";

export const peer = ref(null);
export const messages = ref([]);
export const connections = ref([]);
export const blobPool = ref({});

const connectingPeers = new Set();

peer.value = new Peer(Math.random().toString().slice(2, 11));

function onBroadcast(body) {
  const connectedPeers = new Set(connections.value.map((c) => c.peer));
  for (const pid of body.data)
    if (
      pid !== peer.value.id &&
      !connectedPeers.has(pid) &&
      !connectingPeers.has(pid) &&
      connections.value.length <= 32
    ) {
      connectingPeers.add(pid);
      handleConnection(peer.value.connect(pid));
    }
}

function onBlob(body) {
  const type = blobPool.value[body.digest].type;
  const blob = new Blob([body.data], { type: type });
  blobPool.value[body.digest] = {
    data: body.data,
    url: URL.createObjectURL(blob),
    type: type,
  };
}

function onRequestBlob(body) {
  this.send({
    type: "blob",
    digest: body.digest,
    data: blobPool.value[body.digest].data,
  });
}

function onReceiveData(body) {
  if (body.type === "broadcast") return onBroadcast.call(this, body);
  if (body.type === "blob") return onBlob.call(this, body);
  if (body.type === "requestBlob") return onRequestBlob.call(this, body);

  console.log(body);
  if (body.data instanceof ArrayBuffer) {
    body.url = URL.createObjectURL(new Blob([body.data], { type: body.type }));
    blobPool.value[body.digest] = { type: body.type };
    this.send({
      type: "requestBlob",
      digest: body.digest,
    })
  }

  const messagesIds = new Set(messages.value.map((m) => m.id));
  if (!messagesIds.has(body.id)) messages.value.push(body);
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
      data: connections.value.map((c) => c.peer),
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

async function resizeImage(imageBlob) {
  const blobUrl = URL.createObjectURL(imageBlob);
  const SIZE_LIMIT = 480 * 360;
  const img = await new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.src = blobUrl;
  });

  const canvas = document.createElement("canvas");
  const resizeRatio = Math.sqrt(SIZE_LIMIT / (img.width * img.height));
  canvas.width = resizeRatio * img.width;
  canvas.height = resizeRatio * img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve) => canvas.toBlob(resolve));
}

async function digestHex(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function sendMessage(message) {
  let messageType = null;
  let digest = null;

  if (message instanceof Blob) {
    messageType = message.type;
    digest = await digestHex(message);
    blobPool.value[digest] = {
      data: message,
      type: messageType,
      url: URL.createObjectURL(message),
    };
  }
  else messageType = "text/plain";

  const messageBody = {
    id: Math.random().toString(36).substring(2),
    type: messageType,
    from: peer.value.id,
    data: message,
    timestamp: Date.now(),
  };
  if (messageType.startsWith("image/")) {
    messageBody.data = await resizeImage(message);
    messageBody.digest = digest;
    messageBody.url = blobPool.value[digest].url;
  }

  removeClosedConnections();
  for (let conn of connections.value) {
    conn.send(messageBody);
  }
  messages.value.push(messageBody);
}
