import mongoose, { Schema } from "mongoose";

const FriendRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

// Prevent duplicate pending requests
// Learn THis--------------------------------------------
FriendRequestSchema.index(
  { from: 1, to: 1 },
  { unique: true }
);

export const FriendRequest = mongoose.model(
  "FriendRequest",
  FriendRequestSchema
);
