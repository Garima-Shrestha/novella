import { Router } from "express";
import { AdminCategoryController } from "../../controllers/admin/category.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";

const adminCategoryController = new AdminCategoryController();
const router = Router();

// All routes require logged-in admin
router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post("/", adminCategoryController.createCategory);
router.get("/", adminCategoryController.getAllCategories);
router.get("/:id", adminCategoryController.getCategoryById);
router.put("/:id", adminCategoryController.updateCategory);
router.delete("/:id", adminCategoryController.deleteCategory);

export default router;
