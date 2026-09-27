// src/halabsaudi/chat/components/imagePreviewBridge.ts
//
// React Navigation params me function pass karna non-serializable aur unreliable hota hai.
// Is tiny bridge me sirf current preview ka send callback temporary store hota hai.

export type ImagePreviewSendHandler = (
  asset: any,
  caption: string,
) => void | Promise<void>;

let pendingImageSend: ImagePreviewSendHandler | null = null;

export function setPendingImageSend(handler: ImagePreviewSendHandler) {
  pendingImageSend = handler;
}

export function getPendingImageSend(): ImagePreviewSendHandler | null {
  return pendingImageSend;
}

export function clearPendingImageSend() {
  pendingImageSend = null;
}
