import { Router } from "express";
import authRoutes from "./authRoutes.js";
import chatRoutes from "./chatRoutes.js";

const r = Router();
r.use("/auth", authRoutes);
r.use("/chat", chatRoutes);
export default r;
