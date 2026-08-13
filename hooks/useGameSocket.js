'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

// Module-level singleton: one connection per tab, survives re-renders and
// route changes. Multiple components calling this hook share it.
let socket = null;

export function useGameSocket() {
  const setRoom = useGameStore((s) => s.setRoom);
  const setMyId = useGameStore((s) => s.setMyId);
  const setError = useGameStore((s) => s.setError);
  const setConnected = useGameStore((s) => s.setConnected);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000');
    }
    const onConnect = () => { setMyId(socket.id); setConnected(true); };
    const onDisconnect = () => setConnected(false);
    if (socket.connected) onConnect();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ROOM_STATE', setRoom);
    socket.on('ERROR', setError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ROOM_STATE', setRoom);
      socket.off('ERROR', setError);
      // Deliberately NOT disconnecting — navigating between pages shouldn't
      // bankrupt you. The server's disconnect handler covers tab close.
    };
  }, [setRoom, setMyId, setError, setConnected]);

  const emit = (event, payload) => socket?.emit(event, payload);

  return {
    createRoom: (name) => emit('CREATE_ROOM', { name }),
    joinRoom: (code, name) => emit('JOIN_ROOM', { code, name }),
    pickToken: (token) => emit('PICK_TOKEN', token),
    toggleReady: () => emit('TOGGLE_READY'),
    startGame: () => emit('START_GAME'),
    rollDice: () => emit('ROLL_DICE'),
    buyProperty: () => emit('BUY_PROPERTY'),
    buildHouse: (tileIndex) => emit('BUILD_HOUSE', tileIndex),
    payJailFine: () => emit('PAY_JAIL_FINE'),
    placeBid: (amount) => emit('PLACE_BID', amount),
    endTurn: () => emit('END_TURN'),
  };
}
