import { Router } from "express";
import { KhaltiController } from "../controllers/khalti.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const khaltiController = new KhaltiController();

router.use(authorizedMiddleware);

router.post("/initiate", khaltiController.initiate);
router.post("/verify", khaltiController.verify);

export default router;