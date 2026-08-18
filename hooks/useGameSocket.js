'use client';
import { useEffect } from 'react';
import { getSocket, getSessionId } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';

export function useGameSocket() {
  const setRoom = useGameStore((s) => s.setRoom);
  const setMyId = useGameStore((s) => s.setMyId);
  const setError = useGameStore((s) => s.setError);
  const setConnected = useGameStore((s) => s.setConnected);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const sessionId = getSessionId();
    const socket = getSocket(token);
    const onConnect = () => { setMyId(sessionId); setConnected(true); };
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
  }, [setRoom, setMyId, setError, setConnected, token]);

  const emit = (event, payload) => getSocket(token).emit(event, payload);

  return {
    createRoom: (name) => emit('CREATE_ROOM', { name }),
    joinRoom: (code, name) => emit('JOIN_ROOM', { code, name }),
    pickToken: (token) => emit('PICK_TOKEN', token),
    toggleReady: () => emit('TOGGLE_READY'),
    leaveRoom: () => emit('LEAVE_ROOM'),
    updateSettings: (settings) => emit('UPDATE_SETTINGS', settings),
    startGame: () => emit('START_GAME'),
    rollStartOrder: () => emit('ROLL_START_ORDER'),
    replay: () => emit('REPLAY'),
    rollDice: () => emit('ROLL_DICE'),
    buyProperty: () => emit('BUY_PROPERTY'),
    buildHouse: (tileIndex) => emit('BUILD_HOUSE', tileIndex),
    sellHouse: (tileIndex) => emit('SELL_HOUSE', tileIndex),
    mortgageProperty: (tileIndex) => emit('MORTGAGE_PROPERTY', tileIndex),
    unmortgageProperty: (tileIndex) => emit('UNMORTGAGE_PROPERTY', tileIndex),
    payDebt: () => emit('PAY_DEBT'),
    payJailFine: () => emit('PAY_JAIL_FINE'),
    placeBid: (amount) => emit('PLACE_BID', amount),
    endTurn: () => emit('END_TURN'),
    surrender: () => emit('SURRENDER'),
    sendChat: (text) => emit('CHAT_MESSAGE', text),
    proposeTrade: (offer) => emit('PROPOSE_TRADE', offer),
    respondTrade: (tradeId, accept) => emit('RESPOND_TRADE', { tradeId, accept }),
    cancelTrade: (tradeId) => emit('CANCEL_TRADE', tradeId),
  };
}
