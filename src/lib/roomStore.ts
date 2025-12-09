// src/lib/roomStore.ts
// In-memory RoomStore used by your /api/challenge/* endpoints.
// Replace with Redis-backed implementation later if needed.

export type Player = {
  id: string;            // user id (string)
  username: string;
  joinedAt: string;      // ISO timestamp
  latestScore?: number;  // last submitted score for current challenge
  scores?: number[];     // history for the room (optional)
};

export type RoomResult = {
  playerId: string;
  score: number;
  submittedAt: string;
};

export type Room = {
  id: string;
  ownerId?: string;
  createdAt: string;
  started: boolean;
  startedAt?: string | null;
  players: Player[];
  results: RoomResult[]; // submitted scores for this room / challenge
  meta?: Record<string, any>;
};

export class RoomStore {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  /**
   * Create or fetch a room. If room doesn't exist, it will be created.
   * Adds the player to the room if not already present.
   *
   * @param roomId
   * @param player - { id, username }
   * @param ownerId - optional owner id (set on room creation)
   * @returns the room object (shallow copy)
   */
  addPlayerToRoom(roomId: string, player: Pick<Player, "id" | "username">, ownerId?: string): Room {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        ownerId: ownerId ? String(ownerId) : undefined,
        createdAt: new Date().toISOString(),
        started: false,
        startedAt: null,
        players: [],
        results: [],
        meta: {},
      };
      this.rooms.set(roomId, room);
    }

    // prevent duplicate players (by id)
    const exists = room.players.some((p) => p.id === String(player.id));
    if (!exists) {
      const newPlayer: Player = {
        id: String(player.id),
        username: player.username,
        joinedAt: new Date().toISOString(),
        scores: [],
      };
      room.players.push(newPlayer);
    }

    // return a shallow copy so callers don't accidentally mutate internal map directly
    return { ...room, players: [...room.players], results: [...room.results] };
  }

  /**
   * Return room data or null if not found.
   */
  getRoom(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return { ...room, players: [...room.players], results: [...room.results] };
  }

  /**
   * Start the room (mark started = true and set startedAt). Returns updated room or null.
   */
  startRoom(roomId: string, challengeDay: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.started = true;
    room.startedAt = new Date().toISOString();
    // clear previous results for new challenge (optional behaviour)
    room.results = [];
    // reset players' latestScore
    room.players = room.players.map((p) => ({ ...p, latestScore: undefined, scores: p.scores ?? [] }));
    return { ...room, players: [...room.players], results: [...room.results] };
  }

  /**
   * Add or update a score for a player in a room.
   * Also appends to room.results so others can see it.
   *
   * @param roomId
   * @param playerId
   * @param score
   */
  addScoreToRoom(roomId: string, playerId: string, score: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const playerIndex = room.players.findIndex((p) => p.id === String(playerId));
    if (playerIndex === -1) {
      // If player not present, ignore or optionally add them
      return null;
    }

    // update player's latestScore and scores array
    const player = room.players[playerIndex];
    player.latestScore = score;
    player.scores = player.scores || [];
    player.scores.push(score);

    // push into results (keep last submission only per player if desired)
    const result: RoomResult = {
      playerId: String(playerId),
      score,
      submittedAt: new Date().toISOString(),
    };

    // optionally replace earlier result for same player: remove older result for this player
    room.results = room.results.filter((r) => r.playerId !== String(playerId));
    room.results.push(result);

    // sort results descending by score (useful for quick ranking)
    room.results.sort((a, b) => b.score - a.score);

    // write back player (mutated in place already)
    room.players[playerIndex] = { ...player };

    return { ...room, players: [...room.players], results: [...room.results] };
  }

  /**
   * Remove a player from a room.
   * If the room becomes empty it will be deleted.
   */
  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.players = room.players.filter((p) => p.id !== String(playerId));
    room.results = room.results.filter((r) => r.playerId !== String(playerId));

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return true; // room deleted
    } else {
      this.rooms.set(roomId, room);
      return false; // room still exists
    }
  }

  /**
   * Delete a room explicitly.
   */
  clearRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  /**
   * Return a list of active rooms (IDs only)
   */
  listRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }

  /**
   * For debugging: return the entire internal map as plain objects.
   */
  dumpAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map((r) => ({ ...r, players: [...r.players], results: [...r.results] }));
  }
}

/**
 * Export a singleton instance to keep simple in-memory state across imports.
 * Import with `import { roomStore } from "@/lib/roomStore";`
 */
export const roomStore = new RoomStore();
export default roomStore;
