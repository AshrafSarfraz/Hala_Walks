// import { io } from "socket.io-client";
// import { BASE_URL } from "../../config/api";

// let socket: any = null;

// export const connectSocket = (token: string) => {

//   if (socket) return socket;

//   socket = io(BASE_URL, {
//     transports: ["websocket"],
//     auth: { token },
//   });

//   socket.on("connect", () => {
//     console.log("SOCKET CONNECTED:", socket.id);
//   });

//   socket.on("disconnect", () => {
//     console.log("SOCKET DISCONNECTED");
//   });

//   return socket;
// };

// export const getSocket = () => socket;


import { io } from "socket.io-client";
import { BASE_URL } from "../../config/api";

let socket: any = null;

/**
 * Connects to the socket only once.
 * Returns the same socket instance for all imports.
 */
export const connectSocket = (token: string) => {
  if (socket) return socket; // already connected, return singleton

  socket = io(BASE_URL, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
  });

  // Only attach these once
  socket.once("connect", () => {
    console.log("SOCKET CONNECTED:", socket.id);
  });

  socket.once("disconnect", () => {
    console.log("SOCKET DISCONNECTED");
  });

  return socket;
};

/**
 * Returns the existing socket instance
 */
export const getSocket = () => socket;
