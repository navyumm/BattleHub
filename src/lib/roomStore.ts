// src/lib/roomStore.ts
/**
 * Simple in-memory room store for dev / single-server use.
 * Not for production / multi-instance deployments.
 */

export type Player = {
  id: string;
  username: string;
  joinedAt: string; // ISO
  score?: number;    // optional during match
};

export type Room = {
  id: string;
  ownerId: string;
  createdAt: string;
  started: boolean;
  startsAt?: string | null;
  players: Player[];
  meta?: Record<string, any>;
};

const ROOM_TTL_SECONDS = 60 * 60 * 2; // 2 hours

class RoomStore {
  private rooms = new Map<string, Room>();
  private expiry = new Map<string, number>(); // key -> expiresAt (epoch ms)
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  private cleanExpired() {
    const now = Date.now();
    for (const [roomId, exp] of this.expiry.entries()) {
      if (exp <= now) {
        this.rooms.delete(roomId);
        this.expiry.delete(roomId);
        // console.log("[RoomStore] cleaned expired room", roomId);
      }
    }
  }

  createIfNotExists(roomId: string, ownerId: string, meta: Record<string, any> = {}) {
    if (!this.rooms.has(roomId)) {
      const r: Room = {
        id: roomId,
        ownerId,
        createdAt: new Date().toISOString(),
        started: false,
        players: [],
        meta,
      };
      this.rooms.set(roomId, r);
      this.expiry.set(roomId, Date.now() + ROOM_TTL_SECONDS * 1000);
    } else {
      // refresh ttl
      this.expiry.set(roomId, Date.now() + ROOM_TTL_SECONDS * 1000);
    }
    return this.rooms.get(roomId)!;
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  addPlayer(roomId: string, player: Player) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const exists = room.players.some((p) => p.id === player.id);
    if (!exists) {
      room.players.push(player);
      this.expiry.set(roomId, Date.now() + ROOM_TTL_SECONDS * 1000);
    }
    return room;
  }

  setStarted(roomId: string, started = true) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.started = started;
    if (started) room.startsAt = new Date().toISOString();
    this.expiry.set(roomId, Date.now() + ROOM_TTL_SECONDS * 1000);
    return room;
  }

  updatePlayerScore(roomId: string, playerId: string, score: number) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const p = room.players.find((pl) => pl.id === playerId);
    if (!p) return room;
    p.score = score;
    return room;
  }

  removeRoom(roomId: string) {
    this.rooms.delete(roomId);
    this.expiry.delete(roomId);
  }
}

export const roomStore = new RoomStore();
export default roomStore;
