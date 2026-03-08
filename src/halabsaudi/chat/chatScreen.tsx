// ChatScreen.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Text } from "react-native";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from "socket.io-client";
import { BASE_URL } from "../../config/api";

type TempMessage = IMessage & {
  tempId?: string;
  status?: "sending" | "sent" | "failed";
};

export default function ChatScreen({ route }: any) {
  const { chatId } = route.params;

  const headerHeight = useHeaderHeight();

  const [messages, setMessages] = useState<TempMessage[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const currentUserId = "me";

  // -------------------------------
  // UPSERT MESSAGE (prevent duplicate)
  // -------------------------------

  const upsertMessage = useCallback((msg: TempMessage) => {
    setMessages(prev => {
      const filtered = prev.filter(m => m._id !== msg._id);

      return GiftedChat.append(filtered, [msg]);
    });
  }, []);

  // -------------------------------
  // LOAD TOKEN
  // -------------------------------

  useEffect(() => {
    const load = async () => {
      const t = await AsyncStorage.getItem("hala_token");
      if (t) setToken(t);
    };

    load();
  }, []);

  // -------------------------------
  // FETCH OLD MESSAGES
  // -------------------------------

  useEffect(() => {
    if (!token) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const msgs: TempMessage[] = (data.messages || []).map((m: any) => ({
          _id: m._id,
          text: m.text,
          createdAt: new Date(m.createdAt),
          user: {
            _id: m.sender._id,
            name: m.sender.name,
          },
          status: "sent",
        }));

        setMessages(msgs);
      } catch (err) {
        console.log("Fetch messages error:", err);
      }
    };

    loadMessages();
  }, [token, chatId]);

  // -------------------------------
  // SOCKET SETUP
  // -------------------------------

  useEffect(() => {
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("join-chat", chatId);
    });

    // Receive message
    socket.on("new-message", (msg: any) => {
      const newMsg: TempMessage = {
        _id: msg._id,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.sender._id,
          name: msg.sender.name,
        },
        status: "sent",
      };

      upsertMessage(newMsg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, chatId, upsertMessage]);

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------

  const onSend = useCallback((msgs: TempMessage[] = []) => {
    msgs.forEach(msg => {
      const tempId = Date.now().toString();

      const tempMsg: TempMessage = {
        ...msg,
        _id: tempId,
        tempId,
        text: msg.text,
        createdAt: new Date(),
        user: { _id: currentUserId },
        status: "sending",
      };

      upsertMessage(tempMsg);

      socketRef.current?.emit(
        "send-message",
        {
          chatId,
          text: msg.text,
          tempId,
        },
        (res: any) => {
          if (res?.success) {
            upsertMessage({
              ...tempMsg,
              _id: res._id,
              status: "sent",
            });
          } else {
            upsertMessage({
              ...tempMsg,
              status: "failed",
            });
          }
        }
      );
    });
  }, []);

  // -------------------------------
  // RETRY FAILED MESSAGE
  // -------------------------------

  const retryMessage = useCallback((msg: TempMessage) => {
    if (!socketRef.current) return;

    upsertMessage({ ...msg, status: "sending" });

    socketRef.current.emit(
      "send-message",
      {
        chatId,
        text: msg.text,
        tempId: msg.tempId,
      },
      (res: any) => {
        if (res?.success) {
          upsertMessage({
            ...msg,
            _id: res._id,
            status: "sent",
          });
        } else {
          upsertMessage({
            ...msg,
            status: "failed",
          });
        }
      }
    );
  }, []);

  // -------------------------------
  // BUBBLE UI
  // -------------------------------

  const renderBubble = (props: any) => {
    const m = props.currentMessage as TempMessage;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#0084ff",
          },
          left: {
            backgroundColor: "#e5e5ea",
          },
        }}
      >
        {m.status === "failed" && (
          <Text
            style={{ color: "red", fontSize: 12, marginTop: 4 }}
            onPress={() => retryMessage(m)}
          >
            Retry
          </Text>
        )}
      </Bubble>
    );
  };

  // -------------------------------
  // UI
  // -------------------------------

  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs as TempMessage[])}
      user={{ _id: currentUserId }}
      placeholder="Type a message..."
      renderAvatar={null}
      showUserAvatar={false}
      renderBubble={renderBubble}
      scrollToBottom
      keyboardVerticalOffset={headerHeight}
      listProps={{
        maintainVisibleContentPosition: { minIndexForVisible: 0 },
      }}
    />
  );
}
