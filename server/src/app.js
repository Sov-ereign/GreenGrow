import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import mandiRoutes from "./routes/mandiRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import farmarInfoSave from "./routes/farmarInfoSave.js";
import ivrRoutes from "./routes/ivrRoutes.js";
import plantRoutes from "./routes/plantRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://green-grow-zeta.vercel.app",
  "https://greengrow-n9g5.onrender.com",
  "https://greengrow.vercel.app",
];

const isAllowedOrigin = (origin = "") => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel preview/production domain
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

// Robust CORS configuration for dev
const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-User-Location",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/mandi", mandiRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/farm", farmarInfoSave);
app.use("/api/ivr", ivrRoutes);
app.use("/api/plants", plantRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
