import mongoose, { Schema, model, models } from "mongoose";

const PlayerSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: () => new Date(),
    },
    score: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const RoomSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    
    ownerId: {
      type: String,
    },

    players: {
      type: [PlayerSchema],
      default: [],
    },

    started: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

export default models.Room || model("Room", RoomSchema);