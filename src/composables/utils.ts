export async function resizeImage(imageBlob: Blob, config: {width?: number, height?: number, sizeLimit?: number}) {
  const blobUrl = URL.createObjectURL(imageBlob);
  const img: HTMLImageElement = await new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = () => resolve(img);
    img.src = blobUrl;
  });

  const canvas = document.createElement("canvas");
  if (config.sizeLimit) {
    const resizeRatio = Math.sqrt(config.sizeLimit / (img.width * img.height));
    canvas.width = resizeRatio * img.width;
    canvas.height = resizeRatio * img.height;
  } else {
    canvas.width = config.width;
    canvas.height = config.height;
  }
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const resizedBlob: Blob = await new Promise((resolve) => canvas.toBlob(resolve));
  return resizedBlob;
}

export async function digestHex(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
