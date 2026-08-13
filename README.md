# Monopoly-Georgian

Real-time multiplayer Monopoly with a Georgian theme — board, UI and card text in `ka-GE`,
currency in GEL (₾). Next.js client for a server-authoritative game engine.

Backend lives in a separate repo: [Monopoly-Georgian-Backend](https://github.com/ssbombaguy/Monopoly-Georgian-Backend).

## Stack

Next.js (App Router) · React · Tailwind CSS v4 · Zustand · Framer Motion · Socket.io client

## Setup

Start the backend first, then:

```bash
npm install
cp .env.example .env.local
npm run dev               # starts on :3000
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | Game server origin, defaults to `http://localhost:4000` |

## Playing

Create a room, share the 4-character code, pick a token, ready up. Two to four players.
To test alone, run the backend's `node bot.js <ROOM_CODE>` to add an auto-playing opponent.

## Structure

```
app/                 landing page and /room/[code]
components/
  GameBoard.jsx      11x11 board layout, dice, actions, auctions
  GameTile.jsx       one tile — colour band faces the board centre
  TitleDeed.jsx      title deed card, compact and full variants
  PlayerCard.jsx     player status and their holdings
  TileIcon.jsx       hand-drawn SVG icon set
hooks/
  useGameSocket.js   socket singleton, state sync, action emitters
lib/board.js         board data mirror (presentation only — server is authoritative)
store/gameStore.js   Zustand store
```

The client never computes game outcomes. It emits intents and renders whatever
`ROOM_STATE` the server broadcasts.
