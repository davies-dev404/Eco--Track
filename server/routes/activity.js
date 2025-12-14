import express from "express";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();

// GET all logs (Admin/Global) with optional filters
router.get("/", async (req, res) => {
    try {
        const { limit = 20, type } = req.query;
        let query = {};
        if (type) query.type = type;

        const logs = await ActivityLog.find(query)
            .populate("user", "name role")
            .sort({ createdAt: -1 })
            .limit(Number(limit));
            
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activity logs" });
    }
});

export default router;
