import express from "express";
import Pickup from "../models/Pickup.js";
import WasteRecord from "../models/WasteRecord.js";
import { getIO } from "../socket.js";

const router = express.Router();

// GET all pickups (Admin)
router.get("/all", async (req, res) => {
    try {
        const pickups = await Pickup.find().sort({ date: 1 });
        res.json(pickups);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET assigned pickups for a driver
router.get("/assigned", async (req, res) => {
    try {
        const { driverId } = req.query;
        if (!driverId) return res.status(400).json({ message: "Driver ID required" });

        const pickups = await Pickup.find({ driverId }).sort({ date: 1 });
        res.json(pickups);
    } catch (error) {
        res.status(500).json({ message: "Error fetching assigned pickups" });
    }
});

// GET pending pickups (For Driver "Available" tab)
router.get("/pending", async (req, res) => {
    try {
        const pickups = await Pickup.find({ status: "pending" }).sort({ date: 1 });
        res.json(pickups);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending pickups" });
    }
});

// GET all pickups for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if(!userId) return res.status(400).json({ message: "User ID required" });
    
    const pickups = await Pickup.find({ userId }).sort({ date: 1 }).populate('driverId', 'name vehicleInfo');
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST new pickup request
router.post("/", async (req, res) => {
  try {
    // Expect body: { userId, date, address, wasteTypes }
    const { userId, date, address, wasteTypes = [], notes, wasteRecordIds = [], estimatedWeight = 0 } = req.body;
    
    const newPickup = new Pickup({
        userId,
        date,
        address,
        wasteTypes,
        notes,
        wasteRecordIds,
        estimatedWeight
    });

    await newPickup.save();

    // Mark waste records as scheduled
    if (wasteRecordIds.length > 0) {
        await WasteRecord.updateMany(
            { _id: { $in: wasteRecordIds } },
            { $set: { status: 'scheduled' } }
        );
    }

    try {
        getIO().emit("pickup_created", newPickup);
    } catch (error) {
        console.error("Socket emit failed:", error);
    }

    res.status(201).json(newPickup);
  } catch (error) {
    res.status(500).json({ message: "Error creating pickup request" });
  }
});

import Settings from "../models/Settings.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// PUT update pickup (Admin/Driver)
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Fetch current state for comparison
        const previousPickup = await Pickup.findById(id);
        if (!previousPickup) return res.status(404).json({ message: "Pickup not found" });

        // If driver is collecting, calculate earnings AND credit user
        if (updates.status === 'collected' && updates.actualWeight) {
             const settings = await Settings.getSettings();
             
             let rate = 0.1;
             if (previousPickup && previousPickup.wasteTypes.length > 0) {
                 const type = previousPickup.wasteTypes[0].toLowerCase();
                 rate = settings.pricing.get(type) || 0.1; 
             }
             
             const amount = Number((updates.actualWeight * rate).toFixed(2));
             
             // 1. Driver Earnings
             updates.earnedAmount = amount;

             // 2. User Rewards
             if (previousPickup.userId) {
                 const pointsEarned = Math.round(updates.actualWeight * 10); // 10 points per kg
                 const cashEarned = Number((updates.actualWeight * 5).toFixed(2)); // 5 KES per kg
                 
                 await User.findByIdAndUpdate(previousPickup.userId, { 
                     $inc: { 
                         points: pointsEarned,
                         "wallet.balance": cashEarned
                     },
                     $push: {
                         "wallet.history": {
                             type: 'earning',
                             amount: cashEarned,
                             description: `Recycled ${updates.actualWeight}kg of ${previousPickup.wasteTypes[0] || 'Waste'}`
                         }
                     }
                 });
             }

             // 3. Update Linked Waste Records Status
             if (previousPickup.wasteRecordIds && previousPickup.wasteRecordIds.length > 0) {
                 await WasteRecord.updateMany(
                     { _id: { $in: previousPickup.wasteRecordIds } },
                     { $set: { status: 'collected' } }
                 );
             }
        }
        
        const updatedPickup = await Pickup.findByIdAndUpdate(id, updates, { new: true });

        // ACTIVITY LOGGING
        // 1. Status Change
        if (updates.status && updates.status !== previousPickup.status) {
           await ActivityLog.create({
               user: updates.driverId || previousPickup.userId, // Approximate actor
               action: `PICKUP_${updates.status.toUpperCase()}`,
               details: { pickupId: id, oldStatus: previousPickup.status, newStatus: updates.status },
               type: updates.status === 'collected' ? 'success' : 'info'
           });
        }
        // 2. Driver Assigned
        if (updates.driverId && updates.driverId !== previousPickup.driverId) {
            await ActivityLog.create({
               action: "DRIVER_ASSIGNED",
               details: { pickupId: id, driverId: updates.driverId },
               type: "info"
           });
        }
        
        try {
            getIO().emit("pickup_updated", updatedPickup);
        } catch (error) {
            console.error("Socket emit failed:", error);
        }

        res.json(updatedPickup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating pickup" });
    }
});

export default router;
