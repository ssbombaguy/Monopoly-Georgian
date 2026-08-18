import { create } from 'zustand';

export const useCheckersStore = create((set) => ({
  room: null,
  myId: null,
  error: null,
  connected: false,
  setRoom: (room) => set({ room, error: null }),
  setMyId: (myId) => set({ myId }),
  setError: (error) => set({ error }),
  setConnected: (connected) => set({ connected }),
}));
