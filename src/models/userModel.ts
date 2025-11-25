// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
//   isVerfied: { // optional: keep old field so older entries aren't broken (optional)
//     type: Boolean,
//     default: undefined,
//   },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,

  // NEW: score for leaderboard
  score: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
