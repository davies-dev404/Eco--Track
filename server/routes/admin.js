import express from "express";
import User from "../models/User.js";
import Pickup from "../models/Pickup.js";

const router = express.Router();

// POST /api/admin/migrate-rewards
// Backfills points and wallet balance for historical collected pickups
router.post("/migrate-rewards", async (req, res) => {
    try {
        const users = await User.find({ role: 'user' });
        const results = [];

        for (const user of users) {
            // Find all successful pickups for this user
            const pickups = await Pickup.find({ 
                userId: user._id, 
                status: { $in: ['collected', 'completed'] } 
            });

            if (pickups.length === 0) continue;

            let calculatedPoints = 0;
            let calculatedCash = 0;

            for (const p of pickups) {
                // Use actualWeight if available, otherwise estimated, otherwise 0
                const weight = p.actualWeight || p.estimatedWeight || 0;
                
                // Logic: 10 points/kg, 5 KES/kg
                calculatedPoints += Math.round(weight * 10);
                calculatedCash += Number((weight * 5).toFixed(2));
            }

            // Update User
            // We set points if they are 0 (assuming fresh feature)
            // We increment bucket balance if it seems low? 
            // Better strategy: Since user said "Update so they don't lose points",
            // We should ensure their points reflect their history.
            // If they have 0 points, SET it to calculated. 
            // If they have > 0, we assume they are already using it? 
            // Or just ADD `calculatedPoints` to `points`? 
            // Risk of double count if run multiple times. 
            // Check if we have a flag. Since we don't, let's rely on "If points are 0".
            
            let updated = false;
            if (user.points === 0 && calculatedPoints > 0) {
                 user.points = calculatedPoints;
                 // For wallet, we add to existing balance as they might have had 'credits' migrated or new earnings
                 // But wait, if they have 'credits' (legacy), we should treat that as wallet balance.
                 // If wallet.balance is 0, set it.
                 // Let's safe add to wallet.balance ONLY if points were 0 (implying unmigrated).
                 user.wallet.balance = (user.wallet.balance || 0) + calculatedCash;
                 
                 // Add history entry for migration
                 user.wallet.history.push({
                     type: 'bonus',
                     amount: calculatedCash,
                     description: `Retroactive rewards for ${pickups.length} past pickups`,
                     status: 'completed'
                 });
                 
                 await user.save();
                 updated = true;
            }

            results.push({ 
                email: user.email, 
                pickups: pickups.length, 
                pointsAdded: updated ? calculatedPoints : 0,
                cashAdded: updated ? calculatedCash : 0,
                status: updated ? 'Migrated' : 'Skipped (Already has points)' 
            });
        }

        res.json({ message: "Migration completed", results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Migration failed" });
    }
});

export default router;
