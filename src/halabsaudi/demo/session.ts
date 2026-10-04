import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// This is an unsigned local preview marker, never a backend credential.
export const DEMO_TOKEN = 'demo.eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSJ9.local-preview-only';
export const DEMO_USER = {
  _id: '000000000000000000000001', id: '000000000000000000000001',
  name: 'Demo User', email: 'demo@example.test', phone: '+97400000000',
  bio: 'Local demo account — preview only', avatar: null,
};
const friend = {_id: '000000000000000000000002', id: '000000000000000000000002', name: 'Demo Friend', bio: 'Sample conversation', avatar: null};
const chatId = '000000000000000000000003';
let installed = false;
let privacy = {showLastSeen: true, showOnlineStatus: true, hidePosts: false};
let messages: any[] = [];
export const isDemoToken = (token: string | null | undefined) => token === DEMO_TOKEN;
const hasDemoAuthorization = (headers: any) => {
  const auth = typeof headers?.get === 'function' ? headers.get('Authorization') : headers?.Authorization || headers?.authorization;
  return auth === `Bearer ${DEMO_TOKEN}`;
};

export function demoResponse(url: string, method = 'GET', body: any = {}) {
  if (!__DEV__) throw new Error('Demo preview is available only in development builds.');
  const path = url.split('?')[0];
  if (typeof body === 'string') {try {body = JSON.parse(body);} catch {body = {};}}
  if (/\/users\/privacy$/.test(path)) {
    if (method.toUpperCase() !== 'GET') privacy = {...privacy, ...body};
    return privacy;
  }
  if (/\/message-permission$/.test(path)) return {allowed: true, reason: 'local_demo'};
  if (/\/block\/status\//.test(path)) return {iBlockedThem: false, theyBlockedMe: false};
  if (/\/users\/friends$/.test(path)) return {users: [friend], friends: [friend], total: 1, hasMore: false};
  if (/\/chat\/with\//.test(path)) return {_id: chatId, participant: friend};
  if (/\/messages\/chat\//.test(path)) return {messages, hasMore: false, nextCursor: null};
  if (/\/messages(?:\/send)?$/.test(path) && method.toUpperCase() === 'POST') {
    const message = {...body, _id: `demo-message-${messages.length + 1}`, sender: DEMO_USER, createdAt: new Date().toISOString(), status: 'sent'};
    messages = [...messages, message];
    return message;
  }
  if (/\/chat$/.test(path)) return {chats: [{_id: chatId, participant: friend, lastMessage: messages[messages.length - 1], lastMessageAt: new Date().toISOString(), unreadCount: 0}], hasMore: false};
  if (/\/users\/[^/]+$/.test(path) && !/\/users\/(blocked|search|requests)$/.test(path)) return {...friend, isFriend: true, privacy};
  if (/\/users$/.test(path)) return {users: [friend], hasMore: false};
  // Unknown demo routes return empty local data instead of reaching the server.
  return {data: [], users: [], friends: [], requests: [], posts: [], photos: [], media: [], blockedUsers: [], hasMore: false, total: 0, success: true};
}

export function installDemoTransport() {
  if (installed) return;
  installed = true;
  axios.interceptors.request.use(config => {
    if (hasDemoAuthorization(config.headers)) {
      config.adapter = async request => ({
        data: demoResponse(request.url || '', request.method, request.data),
        status: 200, statusText: 'OK', headers: {}, config: request,
      });
    }
    return config;
  });
  const realFetch = global.fetch;
  global.fetch = (async (input: any, init?: any) => {
    if (hasDemoAuthorization(init?.headers || input?.headers)) {
      const data = demoResponse(typeof input === 'string' ? input : input.url, init?.method || input?.method, init?.body);
      return new Response(JSON.stringify(data), {status: 200, headers: {'Content-Type': 'application/json'}});
    }
    return realFetch(input, init);
  }) as typeof fetch;
}

export async function startDemoSession() {
  if (!__DEV__) throw new Error('Demo preview is available only in development builds.');
  installDemoTransport();
  messages = [{_id: '000000000000000000000004', text: 'Welcome! This is a local demo conversation.', sender: friend, createdAt: new Date().toISOString(), status: 'read'}];
  privacy = {showLastSeen: true, showOnlineStatus: true, hidePosts: false};
  await AsyncStorage.multiRemove(['hala_conversations', 'hala_users_cache', 'hala_blocked_cache']);
  await AsyncStorage.multiSet([
    ['hala_user', 'true'], ['hala_token', DEMO_TOKEN],
    ['hala_user_backend', JSON.stringify(DEMO_USER)],
    ['hala_user_data', JSON.stringify({phoneNumber: DEMO_USER.phone, countryCode: '+974'})],
  ]);
}

// Always install the marker guard; a stale demo marker cannot reach a real API.
installDemoTransport();
