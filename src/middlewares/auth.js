const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found with ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("req.user set:", req.user);
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("authorize req.user:", req.user);
    console.log("authorize allowed roles:", roles);

    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "No user role found" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "User role not authorized" });
    }

    next();
  };
};
