import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - requires valid JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not configured");
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      
      if (!req.user.isActive) {
        return res.status(401).json({ success: false, message: "Account is deactivated" });
      }
      
      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired, please login again" });
      }
      
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
      
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// Optional auth - attaches user if token present, but doesn't require it
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Silently fail - user will be null
      req.user = null;
    }
  }

  next();
};

// Admin only middleware (for future use)
export const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Not authorized as admin" });
  }
};

export default protect;
