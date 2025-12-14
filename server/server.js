import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import wasteRoutes from "./routes/waste.js";
import pickupRoutes from "./routes/pickup.js";
import settingsRoutes from "./routes/settings.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/pickup", pickupRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/activity", activityRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
