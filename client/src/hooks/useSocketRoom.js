import { useEffect } from 'react';
import { getSocket } from '../socket';

export function useSocketRoom(pin, onEvent) {
  useEffect(() => {
    if (!pin) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    // Register all event listeners
    const entries = Object.entries(onEvent || {});
    entries.forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      entries.forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [pin]);
}
