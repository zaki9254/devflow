import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000", {
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (token) => {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
