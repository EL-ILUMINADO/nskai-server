import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getMyRegistrations } from "../controllers/bootcampRegistrationController.js";

const registrationRouter = express.Router();

registrationRouter.get("/me", verifyToken, getMyRegistrations);

export default registrationRouter;
