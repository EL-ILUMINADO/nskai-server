import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./configs/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import bootCampRouter from "./routes/bootcampRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import registrationRouter from "./routes/registrationRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

const PORT = process.env.PORT || 8000;

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API ENDPOINTS

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/bootcamps", bootCampRouter);
app.use("/api/registrations", registrationRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
