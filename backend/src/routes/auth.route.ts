import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/whoami", authorizedMiddleware, authController.getProfile);

router.put(
    "/update-profile",
    authorizedMiddleware,
    uploads.single("image"), // image
    authController.updateProfile
)

router.put("/change-password", authorizedMiddleware, authController.changePassword);

router.post("/request-password-reset", 
    authController.sendResetPasswordEmail);   // Reset Password

export default router;