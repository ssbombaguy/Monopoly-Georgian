'use client';
import { useEffect } from 'react';
import { getSocket, getSessionId } from '../lib/socket';
import { useCheckersStore } from '../store/checkersStore';
import { useAuthStore } from '../store/authStore';

export function useCheckersSocket() {
  const setRoom = useCheckersStore((s) => s.setRoom);
  const setMyId = useCheckersStore((s) => s.setMyId);
  const setError = useCheckersStore((s) => s.setError);
  const setConnected = useCheckersStore((s) => s.setConnected);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const sessionId = getSessionId();
    const socket = getSocket(token);
    const onConnect = () => { setMyId(sessionId); setConnected(true); };
    const onDisconnect = () => setConnected(false);
    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('CHECKERS_ROOM_STATE', setRoom);
    socket.on('ERROR', setError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('CHECKERS_ROOM_STATE', setRoom);
      socket.off('ERROR', setError);
    };
  }, [setRoom, setMyId, setError, setConnected, token]);

  const emit = (event, payload) => getSocket(token).emit(event, payload);

  return {
    createRoom: (name) => emit('CHECKERS_CREATE_ROOM', { name }),
    joinRoom: (code, name) => emit('CHECKERS_JOIN_ROOM', { code, name }),
    toggleReady: () => emit('CHECKERS_TOGGLE_READY'),
    updateSettings: (settings) => emit('CHECKERS_UPDATE_SETTINGS', settings),
    leaveRoom: () => emit('CHECKERS_LEAVE_ROOM'),
    startGame: () => emit('CHECKERS_START_GAME'),
    move: (from, to) => emit('CHECKERS_MOVE', { from, to }),
    surrender: () => emit('CHECKERS_SURRENDER'),
    replay: () => emit('CHECKERS_REPLAY'),
  };
}
