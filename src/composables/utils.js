export async function resizeImage(imageBlob) {
  const blobUrl = URL.createObjectURL(imageBlob);
  const SIZE_LIMIT = 240 * 180;
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

export async function digestHex(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
