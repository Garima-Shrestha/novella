import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.put(
    "/update-profile",
    authorizedMiddleware,
    uploads.single("image"), // image
    authController.updateProfile
)

export default router;