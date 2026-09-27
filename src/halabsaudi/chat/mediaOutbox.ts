// src/halabsaudi/chat/mediaOutbox.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import axios from 'axios';
import {BASE_URL} from '../../config/api';

const STORAGE_KEY = 'hbs_chat_media_outbox_v1';

export type MediaAsset = {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type MediaOutboxJob = {
  tempId: string;
  chatId: string;
  caption: string;
  localUri: string;
  mimeType: string;
  fileName: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  stage: 'queued' | 'uploading' | 'uploaded' | 'sending' | 'failed';
  progress: number;
  error?: string | null;

  // Once these exist, NEVER upload the file again.
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  mediaWidth?: number | null;
  mediaHeight?: number | null;
};

type Listener = (jobs: MediaOutboxJob[]) => void;

let memoryJobs: MediaOutboxJob[] | null = null;
let loadingPromise: Promise<MediaOutboxJob[]> | null = null;
const listeners = new Set<Listener>();

function emit() {
  const snapshot = [...(memoryJobs || [])];
  listeners.forEach(listener => {
    try {
      listener(snapshot);
    } catch {}
  });
}

async function persist() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryJobs || []));
  emit();
}

export async function getMediaOutbox(): Promise<MediaOutboxJob[]> {
  if (memoryJobs) return [...memoryJobs];
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      memoryJobs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(memoryJobs)) memoryJobs = [];
    } catch {
      memoryJobs = [];
    } finally {
      loadingPromise = null;
    }
    return [...(memoryJobs || [])];
  })();

  return loadingPromise;
}

export function subscribeMediaOutbox(listener: Listener) {
  listeners.add(listener);
  if (memoryJobs) listener([...memoryJobs]);
  return () => listeners.delete(listener);
}

function extensionFor(asset: MediaAsset) {
  const fromName = asset.fileName?.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;

  const mime = asset.type || '';
  if (mime.includes('png')) return 'png';
  if (mime.includes('heic')) return 'heic';
  if (mime.includes('heif')) return 'heif';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('quicktime')) return 'mov';
  if (mime.includes('mp4')) return 'mp4';
  return 'jpg';
}

function mediaTypeFor(mime: string): MediaOutboxJob['mediaType'] {
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('image/')) return 'image';
  return 'document';
}

async function persistLocalAsset(asset: MediaAsset, tempId: string) {
  const ext = extensionFor(asset);
  const dir = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/hbs_chat_media`;

  try {
    const exists = await ReactNativeBlobUtil.fs.exists(dir);
    if (!exists) await ReactNativeBlobUtil.fs.mkdir(dir);

    const target = `${dir}/${tempId}.${ext}`;
    const source = asset.uri.replace(/^file:\/\//, '');

    if (asset.uri.startsWith('file://') || asset.uri.startsWith('/')) {
      await ReactNativeBlobUtil.fs.cp(source, target);
      return `file://${target}`;
    }
  } catch (error) {
    console.log('[MEDIA OUTBOX] local copy failed, using picker uri:', error);
  }

  // content:// or another URI: keep original. Upload will still work.
  return asset.uri;
}

export async function enqueueMediaJob(
  chatId: string,
  asset: MediaAsset,
  caption = '',
): Promise<MediaOutboxJob> {
  await getMediaOutbox();

  const tempId =
    `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const mimeType = asset.type || 'image/jpeg';
  const ext = extensionFor(asset);
  const localUri = await persistLocalAsset(asset, tempId);

  const job: MediaOutboxJob = {
    tempId,
    chatId: String(chatId),
    caption: caption.trim(),
    localUri,
    mimeType,
    fileName: asset.fileName || `${tempId}.${ext}`,
    mediaType: mediaTypeFor(mimeType),
    fileSize: asset.fileSize ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
    createdAt: new Date().toISOString(),
    stage: 'queued',
    progress: 0,
    error: null,
  };

  memoryJobs = [...(memoryJobs || []), job];
  await persist();
  return job;
}

export async function patchMediaJob(
  tempId: string,
  patch: Partial<MediaOutboxJob>,
) {
  await getMediaOutbox();
  memoryJobs = (memoryJobs || []).map(job =>
    job.tempId === tempId ? {...job, ...patch} : job,
  );
  await persist();
}

export async function removeMediaJob(tempId: string) {
  await getMediaOutbox();
  memoryJobs = (memoryJobs || []).filter(job => job.tempId !== tempId);
  await persist();
}

export async function retryMediaJob(tempId: string) {
  await patchMediaJob(tempId, {
    stage: 'queued',
    error: null,
    progress: 0,
  });
}

export async function uploadMediaJob(
  job: MediaOutboxJob,
  token: string,
): Promise<MediaOutboxJob> {
  // Critical: uploaded image must never be uploaded again.
  if (job.mediaUrl) return job;

  await patchMediaJob(job.tempId, {
    stage: 'uploading',
    progress: Math.max(job.progress || 0, 1),
    error: null,
  });

  const formData = new FormData();
  formData.append(
    'file',
    {
      uri: job.localUri,
      type: job.mimeType,
      name: job.fileName,
    } as any,
  );
  formData.append('chatId', job.chatId);

  const res = await axios.post(
    `${BASE_URL}/api/messages/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Do not manually set multipart/form-data. Axios adds the boundary.
      },
      timeout: 60000,
      onUploadProgress: event => {
        if (!event.total) return;
        const pct = Math.max(
          1,
          Math.min(99, Math.round((event.loaded / event.total) * 100)),
        );
        patchMediaJob(job.tempId, {progress: pct}).catch(() => {});
      },
    },
  );

  const uploaded = res.data || {};
  if (!uploaded.mediaUrl) {
    throw new Error('Upload returned no media URL');
  }

  const next: MediaOutboxJob = {
    ...job,
    stage: 'uploaded',
    progress: 100,
    mediaUrl: uploaded.mediaUrl,
    thumbnailUrl: uploaded.thumbnailUrl || null,
    mediaType: uploaded.mediaType || job.mediaType,
    mediaName: uploaded.mediaName || job.fileName,
    mediaSize: uploaded.mediaSize ?? job.fileSize ?? null,
    mediaWidth: uploaded.mediaWidth ?? job.width ?? null,
    mediaHeight: uploaded.mediaHeight ?? job.height ?? null,
    error: null,
  };

  await patchMediaJob(job.tempId, next);
  return next;
}
