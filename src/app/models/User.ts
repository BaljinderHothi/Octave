// defines how users are stored in our MongoDB users collection

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    zipCode: { type: String, required: true },
    preferences: {
      food: { type: [String], default: [] },
      activities: { type: [String], default: [] },
      places: { type: [String], default: [] },
      custom: { type: [String], default: [] },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);


export default mongoose.models.User || mongoose.model("User", UserSchema);
