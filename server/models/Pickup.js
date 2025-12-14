import mongoose from "mongoose";

const PickupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  address: { type: String, required: true },
  city: { type: String },
  street: { type: String },
  location: {
      lat: { type: Number },
      lng: { type: Number }
  },
  wasteTypes: [{ type: String }],
  wasteRecordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "WasteRecord" }],
  status: { 
    type: String, 
    enum: ["pending", "approved", "assigned", "accepted", "in_progress", "collected", "completed", "cancelled", "rejected"], 
    default: "pending" 
  },
  notes: { type: String },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  driverNotes: { type: String },
  instructions: { type: String },
  photos: [{ type: String }],
  assignedAt: { type: Date },
  collectedAt: { type: Date },
  estimatedWeight: { type: Number }, // Sum of linked WasteRecords
  actualWeight: { type: Number }, // in kg
  earnedAmount: { type: Number, default: 0 }, // Calculated payment
}, { timestamps: true });

export default mongoose.model("Pickup", PickupSchema);
