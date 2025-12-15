import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "driver"], default: "user" },
  isActive: { type: Boolean, default: true },
  availability: { type: String, enum: ["online", "offline"], default: "offline" }, // Only for drivers
  credits: { type: Number, default: 0 }, // Legacy
  points: { type: Number, default: 0 }, // Reward Points
  wallet: {
      balance: { type: Number, default: 0 }, // Cash Earnings
      pending: { type: Number, default: 0 },
      history: [{
          type: { type: String, enum: ['earning', 'withdrawal', 'bonus'] },
          amount: Number,
          date: { type: Date, default: Date.now },
          status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
          description: String
      }]
  },
  avatar: { type: String, default: "" }, // Profile Photo URL
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  // Vehicle Details
  vehicle: {
      type: { type: String, enum: ['Car', 'Lorry', 'Truck', 'Motorcycle', 'TukTuk', 'Van'], default: 'Truck' },
      energyType: { type: String, enum: ['Electric', 'Fuel'], default: 'Fuel' },
      plate: { type: String, default: "" },
      model: { type: String, default: "" },
      year: { type: Number },
      capacity: { type: Number }, // in kg
      color: { type: String },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      documents: {
          insurance: String, // URL
          logbook: String,   // URL
          license: String    // URL
      }
  },
  // Wallet & Earnings
  wallet: {
      balance: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      history: [{
          type: { type: String, enum: ['earning', 'withdrawal', 'bonus'] },
          amount: Number,
          date: { type: Date, default: Date.now },
          status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
          description: String
      }]
  },
  vehicleInfo: { type: String, default: "Unassigned Vehicle" }, // Legacy compatibility
  vehicleType: { type: String, default: "" }, // Legacy compatibility
  vehiclePlate: { type: String, default: "" }, // Legacy compatibility
  // Documents & Next of Kin
  documents: {
      idCard: String,
      license: String,
      goodConduct: String
  },
  nextOfKin: {
      name: String,
      relation: String,
      phone: String
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
