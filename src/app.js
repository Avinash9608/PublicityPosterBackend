const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const fs = require("fs");
const path = require("path");
// Route files
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/aiRoutes");
const contactRoutes = require("./routes/contactRoutes");
const posterProRoutes = require("./routes/posterPro.routes");
const app = express();
// ✅ Ensure uploads/kyc directory exists
const dir = path.join(__dirname, "uploads/kyc");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://poster-self.vercel.app",
  "https://poster-builder-pro-admin-panel.vercel.app",
  "https://publicity-poster-pro.vercel.app",
];
// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"], // Add any custom headers you need
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" })); // To handle large base64 images

app.use(express.urlencoded({ extended: true }));
const templateRoutes = require("./routes/template.routes");
app.use("/api/templates", templateRoutes);

// Mount routers
app.use("/api/auth", authRoutes);

// Mount routers
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posters", require("./routes/posters"));
app.use("/api/ai", aiRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/posterpro", posterProRoutes);
// Error handler middleware
app.use(errorHandler);

module.exports = app;
