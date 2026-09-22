// src/halabsaudi/Notifications/badge.ts
//
// ═══════════════════════════════════════════════════════════════════════
//  "NOTIFICATION COUNT KHATAM HI NAHI HOTA" — YAHAN FIX HAI
// ═══════════════════════════════════════════════════════════════════════
//
//  Poore app me search kiya. Notification saaf karne ka code EK JAGAH
//  BHI NAHI THA:
//
//    setBadgeCount                ❌ kahin nahi
//    cancelNotification           ❌ kahin nahi
//    cancelAllNotifications       ❌ kahin nahi
//    cancelDisplayedNotification  ❌ kahin nahi
//    getBadgeCount                ❌ kahin nahi
//    groupId / threadId           ❌ kahin nahi
//
//  Teen alag masle is se paida hote the:
//
//  ─ 1 ─ HAR MESSAGE NAYI NOTIFICATION BANATA THA
//        App.tsx aur index.js dono me `notifee.displayNotification({...})`
//        bina `id` ke call hota tha. Bina id ke notifee har baar NAYI
//        notification banata hai. 20 message = tray me 20 notifications.
//
//        Fix: `id: chat-<chatId>`. Ab ek chat ki nayi notification purani
//        ko REPLACE kar deti hai. Ek chat = hamesha ek notification.
//
//  ─ 2 ─ CHAT KHOLNE PAR NOTIFICATION TRAY ME PADI REHTI THI
//        chatScreen.tsx me `notifee` ka zikr tak nahi tha. User message
//        padh leta tha lekin notification wahin rehti thi.
//
//        Fix: clearChatNotifications() — screen khulte hi.
//
//  ─ 3 ─ APP ICON KA BADGE KABHI RESET NAHI HOTA THA
//        Sirf barhta rehta tha. 47, 48, 49... kabhi 0 nahi.
//
//        Fix: setBadgeFromChats() — badge hamesha asli unread count se
//        calculate hota hai, chat list se.
//
// ── KAHAN LAGA HAI ───────────────────────────────────────────────────
//   App.tsx             → foreground message, notification tap, app resume
//   index.js            → background / app band hone par aane wala message
//   chatScreen.tsx      → chat khulte hi
//   conversationScreen  → list load, naya message, chat kholna
//   Bottom_Navigation   → chat tab ka badge

import notifee, {AndroidStyle} from '@notifee/react-native';

/**
 * Ek chat ki notification ka FIXED id.
 *
 * Yehi poore fix ki jarh hai. Same id dobara use karne par notifee
 * purani notification ko replace karta hai, nayi nahi banata.
 */
export function chatNotificationId(chatId: string): string {
  return `chat-${chatId}`;
}

// ═══════════════════════════════════════════════════════════════════════
//  BADGE (app icon par number)
// ═══════════════════════════════════════════════════════════════════════

/** Badge set karo. 0 bhejne par badge gayab ho jata hai. */
export async function setBadge(count: number): Promise<void> {
  try {
    await notifee.setBadgeCount(Math.max(0, Math.floor(count || 0)));
  } catch (e) {
    console.log('[badge] setBadge:', e);
  }
}

/** Abhi ka badge padho */
export async function getBadge(): Promise<number> {
  try {
    return (await notifee.getBadgeCount()) || 0;
  } catch {
    return 0;
  }
}

/**
 * Badge ko chat list ke asli unread counts se calculate karo.
 *
 * Ye sabse ahem function hai. Badge ko "barhate" nahi — har baar poori
 * list se dobara ginte hain. Is liye wo kabhi atak nahi sakta.
 *
 * Muted chats count nahi hotin — user ne unhe chup karaya hai.
 */
export async function setBadgeFromChats(
  chats: Array<{ unreadCount?: number; isMuted?: boolean }>,
): Promise<number> {
  const total = (chats || []).reduce(
    (sum, c) => (c?.isMuted ? sum : sum + (c?.unreadCount || 0)),
    0,
  );
  await setBadge(total);
  return total;
}

// ═══════════════════════════════════════════════════════════════════════
//  TRAY SAAF KARNA
// ═══════════════════════════════════════════════════════════════════════

/**
 * Ek chat ki saari notifications tray se hatao.
 *
 * Do tarah ki notifications hoti hain:
 *   - nayi (fixed id `chat-<id>`)  → seedha cancel
 *   - purani (random id)           → data.chatId se dhoondh kar cancel
 *
 * Doosri wajah se hai ke jo notifications purane build se tray me pari
 * hain, update ke baad bhi saaf ho jayen.
 */
export async function clearChatNotifications(chatId: string): Promise<void> {
  if (!chatId) return;
  try {
    await notifee.cancelDisplayedNotification(chatNotificationId(chatId)).catch(() => {});

    const displayed = await notifee.getDisplayedNotifications();
    const stale = displayed.filter(
      n => String(n.notification?.data?.chatId || '') === String(chatId),
    );

    await Promise.all(
      stale.map(n =>
        n.id ? notifee.cancelDisplayedNotification(n.id).catch(() => {}) : null,
      ),
    );
  } catch (e) {
    console.log('[badge] clearChatNotifications:', e);
  }
}

/** Logout par sab kuch saaf */
export async function clearAllNotifications(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
    await setBadge(0);
  } catch (e) {
    console.log('[badge] clearAll:', e);
  }
}

/**
 * Tray me jo bacha hai usi se badge sync karo.
 *
 * App foreground hone par chalta hai. Agar user ne notifications khud
 * swipe kar di hon to badge bhi utna kam ho jaye — pehle wo atka rehta tha.
 */
export async function syncBadgeWithTray(): Promise<void> {
  try {
    const displayed = await notifee.getDisplayedNotifications();
    await setBadge(displayed.filter(n => n.notification?.data?.chatId).length);
  } catch (e) {
    console.log('[badge] syncBadgeWithTray:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════
//  NOTIFICATION DIKHANA — sahi tareeqa
// ═══════════════════════════════════════════════════════════════════════

/**
 * Chat message ki notification.
 *
 * Purane code se teen farq:
 *   1. `id` fixed hai → nayi purani ko replace karti hai (jama nahi hotin)
 *   2. Android `groupId` / iOS `threadId` → ek chat ki notifications
 *      ek hi group me ikathi hoti hain
 *   3. `autoCancel` → tap par khud hat jati hai
 */
export async function displayChatNotification(params: {
  chatId: string;
  title: string;
  body: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  imageUrl?: string;
  channelId?: string;
}): Promise<void> {
  const {
    chatId,
    title,
    body,
    senderId = '',
    senderName = '',
    senderAvatar = '',
    imageUrl,
    channelId = 'chat_messages',
  } = params;

  if (!chatId) return;

  const id = chatNotificationId(chatId);

  try {
    await notifee.displayNotification({
      id, // ✅ yehi fix hai
      title,
      body,
      data: {
        chatId: String(chatId),
        senderId: String(senderId),
        senderName: String(senderName),
        senderAvatar: String(senderAvatar),
      },
      android: {
        channelId,
        importance: 4, // HIGH
        pressAction: { id: 'default' },
        showTimestamp: true,
        sound: 'default',
        groupId: id,
        autoCancel: true,
        ...(imageUrl
          ? { largeIcon: imageUrl, style: { type: AndroidStyle.BIGPICTURE, picture: imageUrl } }
          : {}),
      },
      ios: {
        sound: 'default',
        threadId: id,
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
    });
  } catch (e) {
    console.log('[badge] displayChatNotification:', e);
  }
}

export default {
  chatNotificationId,
  setBadge,
  getBadge,
  setBadgeFromChats,
  clearChatNotifications,
  clearAllNotifications,
  syncBadgeWithTray,
  displayChatNotification,
};
