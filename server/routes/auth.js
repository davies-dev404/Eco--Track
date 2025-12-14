import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, phone: user.phone } });
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
        const { userId, name, email, address, phone } = req.body;
        
        // Simple validation or middleware check usually goes here
        // For now trusting the ID passed (in real app, use auth middleware to get ID from token)
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (address !== undefined) user.address = address;
        if (phone !== undefined) user.phone = phone;
        // if (password) ... handle password update with hashing

        await user.save();
        
        // Return updated user info
        res.json({ id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, phone: user.phone });
    } catch (error) {
        res.status(500).json({ message: "Server error updating profile" });
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
