import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Actor
  action: { type: String, required: true }, // e.g., "PICKUP_CREATED", "DRIVER_ASSIGNED"
  details: { type: Object }, // Flexible JSON for details (pickupId, etc)
  type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
}, { timestamps: true });

export default mongoose.model("ActivityLog", ActivityLogSchema);
