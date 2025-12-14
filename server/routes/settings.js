import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// GET settings
router.get("/", async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
});

// PUT update settings
router.put("/", async (req, res) => {
    try {
        const { pricing, zones } = req.body;
        // Upsert
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        if (pricing) settings.pricing = pricing;
        if (zones) settings.zones = zones;
        
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error updating settings" });
    }
});

export default router;
