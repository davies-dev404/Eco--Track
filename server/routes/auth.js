import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getIO } from "../socket.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedRole = "user";
    if (role === "admin") {
        if (secretKey === "eco_admin_secret_2024") {
            assignedRole = "admin";
        } else {
            return res.status(403).json({ message: "Invalid admin secret key" });
        }
    } else if (role === "driver") {
        assignedRole = "driver";
    }

    const newUser = new User({ name, email, password: hashedPassword, role: assignedRole });
    await newUser.save();

    try {
        getIO().emit("user_registered", { name, email, role: assignedRole });
    } catch (e) {
        console.error("Socket emit failed:", e);
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        address: user.address, 
        phone: user.phone, 
        avatar: user.avatar,
        points: user.points,
        wallet: user.wallet,
        vehicle: user.vehicle,
        nextOfKin: user.nextOfKin,
        documents: user.documents,
        vehicleType: user.vehicleType, 
        vehiclePlate: user.vehiclePlate 
    } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to claim admin rights (for demo/setup purposes)
router.put("/promote", async (req, res) => {
    try {
        const { userId, secretKey } = req.body;
        
        // Simple hardcoded secret for this demo
        if (secretKey !== "eco_admin_secret_2024") {
            return res.status(403).json({ message: "Invalid admin secret key" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = "admin";
        await user.save();

        res.json({ 
            message: "User promoted to admin", 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                address: user.address, 
                phone: user.phone 
            } 
        });
    } catch (error) {
         res.status(500).json({ message: "Server error promoting user" });
    }
});

router.put("/profile", async (req, res) => {
    try {
        const { userId, name, email, address, phone, avatar } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (address !== undefined) user.address = address;
        if (phone !== undefined) user.phone = phone;
        if (avatar !== undefined) user.avatar = avatar;

        // Nested Updates (Next of Kin)
        if (req.body.nextOfKin) {
            user.nextOfKin = { ...user.nextOfKin, ...req.body.nextOfKin };
        }

        // Nested Updates (Documents - Personal)
        if (req.body.documents) {
            user.documents = { ...user.documents, ...req.body.documents };
        }
        
        // Driver Vehicle Updates
        if (req.body.vehicleType) user.vehicleType = req.body.vehicleType;
        if (req.body.vehicle) {
            // Handle nested vehicle update including status reset if critical info changes?
            // For now just merge
             user.vehicle = { ...user.vehicle, ...req.body.vehicle };
             // Legacy sync
             if(req.body.vehicle.plate) user.vehiclePlate = req.body.vehicle.plate;
             if(req.body.vehicle.type) user.vehicleType = req.body.vehicle.type;
        }

        if (req.body.vehiclePlate) {
            user.vehiclePlate = req.body.vehiclePlate;
            if (user.vehicleType) {
                user.vehicleInfo = `${user.vehicleType} - ${req.body.vehiclePlate}`;
            } else {
                user.vehicleInfo = req.body.vehiclePlate;
            }
        }

        await user.save();
        
        // Return updated user info
        res.json({ 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            address: user.address, 
            phone: user.phone, 
            avatar: user.avatar,
            points: user.points,
            wallet: user.wallet,
            vehicle: user.vehicle,
            nextOfKin: user.nextOfKin,
            documents: user.documents,
            vehicleType: user.vehicleType, 
            vehiclePlate: user.vehiclePlate 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error updating profile" });
    }
});

// Change Password
router.put("/change-password", async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error updating password" });
    }
});

// Get all drivers (Admin helper)
router.get("/drivers", async (req, res) => {
    try {
        const drivers = await User.find({ role: "driver" }).select("name email _id");
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching drivers" });
    }
});

// Admin: Get all users
router.get("/users", async (req, res) => {
    try {
        // In a real app, verify admin role from token here
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});



// Admin: Update user (role, status)
router.put("/users/:id", async (req, res) => {
    try {
        const { role, isActive, availability } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (availability) user.availability = availability;
        
        await user.save();
        
        // Broadcast update via Socket.io
        try {
            console.log("Broadcasting driver_updated:", user.name, user.availability);
            const io = getIO();
            // detailed payload for admin dash
            io.emit("driver_updated", { 
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                availability: user.availability,
                vehicleInfo: user.vehicleInfo 
            });
        } catch (socketError) {
            console.error("Socket emit failed:", socketError);
        }

        res.json({ message: "User updated successfully", user: { id: user._id, name: user.name, role: user.role, isActive: user.isActive, availability: user.availability } });
    } catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
});

// Get user by ID (for profile/wallet refresh)
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
});

export default router;
