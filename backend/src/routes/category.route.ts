import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const categoryController = new CategoryController();
const router = Router();

// All routes require logged-in user
router.use(authorizedMiddleware);

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

export default router;
