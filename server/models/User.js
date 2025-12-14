import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "driver"], default: "user" },
  isActive: { type: Boolean, default: true },
  availability: { type: String, enum: ["online", "offline"], default: "offline" }, // Only for drivers
  credits: { type: Number, default: 0 }, // Wallet balance
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  vehicleInfo: { type: String, default: "Unassigned Vehicle" }, // Only for drivers
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
