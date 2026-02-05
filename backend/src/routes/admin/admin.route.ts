import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";
import { uploads } from "../../middlewares/upload.middleware";

let adminUserController = new AdminUserController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post('/', uploads.single("image"), adminUserController.createUser);
router.get('/:id', adminUserController.getUserById);
router.get('/', adminUserController.getAllUsers); 
router.put('/:id', uploads.single("image"), adminUserController.updateOneUser);
router.delete('/:id', adminUserController.deleteOneUser);

export default router;