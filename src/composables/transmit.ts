import { ref, shallowRef, triggerRef } from "vue";
import { Peer } from "peerjs";

import { profile, signKeypair, users } from "./state";
import stream from "./stream";
import { digestHex, resizeImage } from "./utils";

export const peer = shallowRef({ connections: {} } as Peer);
export const messages = ref([]);
export const connections = ref([]);
export const blobPool = ref({});
export const streaming = ref([]);

const connectingPeers = new Set();
const MAX_CONNECTIONS = 32;

const manualIdMatch = location.search.match(/m=([\da-f-]{6,})/);
const proposedID = manualIdMatch
  ? manualIdMatch[1]
  : Math.random().toString().slice(2, 11);
peer.value = new Peer(proposedID);

class TransmitEventTarget extends EventTarget {
  public on(event: string, callback: { (detail: any): void }) {
    super.addEventListener(event, ((event: CustomEvent) => {
      const { detail } = event;
      callback(detail);
    }) as EventListener);
  }
}

const events = new TransmitEventTarget();

events.on("broadcast", (detail) => {
  const { body } = detail;
  const connectedPeers = new Set(connections.value.map((c) => c.peer));
  // When building the complete graph, peers may be broadcasted more than once.
  // Skip if the peer is already connected or connecting.
  for (const pid of body.data)
    if (
      pid !== peer.value.id &&
      !connectedPeers.has(pid) &&
      !connectingPeers.has(pid) &&
      connections.value.length <= MAX_CONNECTIONS
    ) {
      connectingPeers.add(pid);
      handleConnection(peer.value.connect(pid, { reliable: true }));
    }
});

events.on("profile", (detail) => {
  const { connection, body } = detail;
  users.value[connection.peer] = body.profile;
});

events.on("blob", (detail) => {
  const { body } = detail;
  const type = blobPool.value[body.digest].type;
  const blob = new Blob([body.data], { type: type });
  blobPool.value[body.digest] = {
    data: body.data,
    url: URL.createObjectURL(blob),
    type: type,
  };
});

events.on("requestBlob", (detail) => {
  const { connection, body } = detail;
  connection.send({
    type: "event/blob",
    digest: body.digest,
    data: blobPool.value[body.digest].data,
  });
});

events.on("streamStart", (detail) => {
  const { connection } = detail;
  streaming.value.push(connection.peer);
});

export function joinStream() {
  for (const connection of connections.value)
    if (streaming.value.includes(connection.peer))
      connection.send({ type: "event/joinStream" });
}

events.on("streamEnd", (detail) => {
  const { connection, body } = detail;
  streaming.value.splice(streaming.value.indexOf(connection.peer), 1);
  stream.removeIncoming(body.id);
});

events.on("joinStream", (detail) => {
  const { connection } = detail;
  const call = peer.value.call(connection.peer, stream.myself.value);
  call.on("stream", (mediaStream) => {
    triggerRef(peer);
    mediaStream.connection = call;
    stream.addIncoming(mediaStream);
  });
});

function onReceiveData(body) {
  // `event/` prefix is used to distinguish messages from other types.
  if (body.type.startsWith("event/")) {
    const eventDetail = { detail: { connection: this, body: body } };
    events.dispatchEvent(new CustomEvent(body.type.slice(6), eventDetail));
    return;
  }

  // Data is a thumbnail, so create a blob URL and request the full blob
  if (body.data instanceof ArrayBuffer) {
    body.url = URL.createObjectURL(new Blob([body.data], { type: body.type }));
    blobPool.value[body.digest] = { type: body.type };
    this.send({
      type: "event/requestBlob",
      digest: body.digest,
    });
  }

  // Filter out repeated messages
  const messagesIds = new Set(messages.value.map((m) => m.id));
  if (!messagesIds.has(body.id)) messages.value.push(body);
}

function onError(err) {
  // Display error as a private message.
  messages.value.push({
    id: Math.random().toString(36).substring(2),
    type: "text/plain",
    from: "System",
    data: "Error: " + err.message,
    timestamp: Date.now(),
    private: true,
  });
}

function handleConnection(connection) {
  // Walkaround that manually fires the `close` event.
  connection.peerConnection.addEventListener("connectionstatechange", () => {
    const connectionState = connection.peerConnection.connectionState;
    if (["failed", "disconnected"].includes(connectionState))
      connection.close();
  });

  connection.on("data", onReceiveData);
  connection.on("error", onError);
  connection.on("close", removeClosedConnections);
  connection.on("open", function () {
    triggerRef(peer);
    connections.value.push(this);
    connectingPeers.delete(this.peer);

    // Broadcast the new connection to all peers and build a complete graph.
    this.send({
      type: "event/broadcast",
      from: peer.value.id,
      data: connections.value.map((c) => c.peer),
    });

    // If this user is streaming, notify the new peer.
    if (stream.myself.value) connection.send({ type: "event/streamStart" });

    // Send user profile
    const timestamp = Date.now();
    const callback = (signature) => {
      connection.send({
        type: "event/profile",
        profile: profile.value,
        signature: signature,
        timestamp: timestamp,
      });
    };

    if (profile.value.nickname) {
      crypto.subtle
        .importKey(
          "jwk",
          signKeypair.value.privateKey,
          { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
          false,
          ["sign"]
        )
        .then((privateKey) => {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(
            `${profile.value.nickname}\n${timestamp}`
          );
          crypto.subtle
            .sign("RSASSA-PKCS1-v1_5", privateKey, encoded)
            .then(callback);
        });
    } else {
      callback(null);
    }

    // Private messages (e.g. from the system) are not broadcasted.
    for (const message of messages.value) {
      if (!message.private) this.send(message);
    }
  });
}

peer.value.on("open", function (id) {
  triggerRef(peer);

  // Connect to the peer specified in the URL, if any.
  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch && connections.value.length <= MAX_CONNECTIONS) {
    connectingPeers.add(id);
    handleConnection(peer.value.connect(peerIdMatch[1], { reliable: true }));
  }

  users.value[id] = profile.value;

  // For sharing in wechat, replace the current URL with peer ID.
  if (/micromessenger/i.test(navigator.userAgent))
    window.history.replaceState(null, null, `?p=${id}`);
});

peer.value.on("call", async function (mediaConnection) {
  mediaConnection.answer(stream.myself.value);
  mediaConnection.on("stream", (mediaStream) => {
    triggerRef(peer);
    mediaStream.connection = mediaConnection;
    stream.addIncoming(mediaStream);
  });
});

peer.value.on("connection", handleConnection);
peer.value.on("disconnected", peer.value.reconnect);
peer.value.on("error", onError);
window.addEventListener("beforeunload", () => peer.value.destroy());

function removeClosedConnections() {
  for (let i = 0; i < connections.value.length; i++) {
    const connection = connections.value[i];
    if (!connection.open) {
      connections.value.splice(i, 1);
      streaming.value.splice(streaming.value.indexOf(connection.peer), 1);
      i--;
    }
  }
  triggerRef(peer);
}

stream.on("start", async function () {
  for (let conn of connections.value) {
    conn.send({
      type: "event/streamStart",
    });
  }
  joinStream();
});

stream.on("end", async function (event) {
  const streamId = event.detail;
  for (let conn of connections.value) {
    conn.send({
      type: "event/streamEnd",
      id: streamId,
    });
  }
});

export async function sendMessage(message: string | Blob) {
  const messageBody: Record<string, any> = {
    id: Math.random().toString(36).substring(2),
    type: message instanceof Blob ? message.type : "text/plain",
    from: peer.value.id,
    data: message,
    timestamp: Date.now(),
  };

  if (message instanceof Blob) {
    messageBody.digest = await digestHex(message);
    const blobUrl = URL.createObjectURL(message);
    blobPool.value[messageBody.digest] = {
      data: message,
      type: message.type,
      url: blobUrl,
    };
    messageBody.url = blobUrl;

    // Create thumbnail for images.
    if (messageBody.type.startsWith("image/"))
      messageBody.data = await resizeImage(message, { sizeLimit: 240 * 180 });
  }

  removeClosedConnections();
  for (let conn of connections.value) {
    conn.send(messageBody);
  }
  messages.value.push(messageBody);
}

function sendEvent(event, detail, peer = null) {
  const messageBody = {
    id: Math.random().toString(36).substring(2),
    type: `event/${event}`,
    from: peer.value.id,
    detail: detail,
    timestamp: Date.now(),
  };

  for (let conn of connections.value) {
    if (!peer || conn.peer === peer) conn.send(messageBody);
  }
}
