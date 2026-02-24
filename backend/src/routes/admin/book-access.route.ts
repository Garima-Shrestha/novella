import { Router } from "express";
import { AdminBookAccessController } from "../../controllers/admin/book-access.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";

let adminBookAccessController = new AdminBookAccessController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post("/", adminBookAccessController.createBookAccess);
router.get('/available-books', adminBookAccessController.getAvailableBooks);
router.get('/', adminBookAccessController.getAllBookAccesses);
router.get('/:id', adminBookAccessController.getBookAccessById);
// router.put('/:id', pdfUpload.single("pdfUrl"), adminBookAccessController.updateBookAccess);
router.put('/:id', adminBookAccessController.updateBookAccess)
router.delete('/:id', adminBookAccessController.deleteBookAccess);

export default router;
