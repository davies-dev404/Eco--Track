import mongoose from "mongoose";

const WasteRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["plastic", "paper", "glass", "metal", "organic", "ewaste"],
    required: true,
  },
  weight: { type: Number, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  carbonSaved: { type: Number },
  status: { type: String, enum: ["logged", "scheduled", "collected"], default: "logged" },
}, { timestamps: true });

export default mongoose.model("WasteRecord", WasteRecordSchema);
