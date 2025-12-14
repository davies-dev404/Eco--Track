import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  pricing: {
    type: Map,
    of: Number,
    default: {
        plastic: 0.5,
        paper: 0.2,
        glass: 0.1,
        metal: 0.8,
        ewaste: 1.5,
        organic: 0.05
    }
  },
  zones: [{ type: String, default: ["Downtown", "North Suburbs"] }]
}, { timestamps: true });

// Singleton pattern helper
SettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.model("Settings", SettingsSchema);
