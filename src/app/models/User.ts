// defines how users are stored in our MongoDB users collection

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    address: { type: String },
    zipCode: { type: String, required: true },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
