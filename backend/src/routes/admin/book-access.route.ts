import { Router } from "express";
import { AdminBookAccessController } from "../../controllers/admin/book-access.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";
import { pdfUpload } from "../../middlewares/pdf-upload.middleware";

let adminBookAccessController = new AdminBookAccessController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post('/', pdfUpload.single("pdfUrl"), adminBookAccessController.createBookAccess);
router.get('/', adminBookAccessController.getAllBookAccesses);
router.get('/:id', adminBookAccessController.getBookAccessById);
// router.put('/:id', pdfUpload.single("pdfUrl"), adminBookAccessController.updateBookAccess);
router.put('/:id', adminBookAccessController.updateBookAccess)
router.delete('/:id', adminBookAccessController.deleteBookAccess);

export default router;
