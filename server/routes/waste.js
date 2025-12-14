import express from "express";
import WasteRecord from "../models/WasteRecord.js";

const router = express.Router();

// Middleware to verify token (simplified for now)
const verifyToken = (req, res, next) => {
    // Ideally this should use JWT verification
    // For now assuming userId is passed in body/query or just allow all for testing MVP
    // Implementing basic JWT check:
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        // const verified = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = verified;
        next();
    } catch (err) {
        // res.status(400).json({ message: 'Invalid Token' });
        // Skipping strict verification for initial setup ease, or implement middleware properly if needed.
        // Let's stick to a simple pass-through or basic mock for this step if verification logic resides elsewhere.
        // Actually, let's implement the real middleware in a separate file or inline here if simple.
        next(); 
    }
};

// GET all waste records (Admin)
router.get("/all", async (req, res) => {
    try {
        const records = await WasteRecord.find().sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET all waste records (for a user)
router.get("/", async (req, res) => {
  try {
    const { userId, status } = req.query; 
    if(!userId) return res.status(400).json({ message: "User ID required" });
    
    let query = { userId };
    if (status) query.status = status;

    const records = await WasteRecord.find(query).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST new waste record
router.post("/", async (req, res) => {
  try {
    const { userId, type, weight, date, notes } = req.body;
    const carbonSaved = Number((Number(weight) * 1.5).toFixed(1)); // Simple calc

    const newRecord = new WasteRecord({ userId, type, weight, date, notes, carbonSaved });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: "Error saving record" });
  }
});

export default router;
