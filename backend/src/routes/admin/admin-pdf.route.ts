import { Router } from "express";
import { AdminPDFController } from "../../controllers/admin/admin-pdf.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";
import { pdfUpload } from "../../middlewares/pdf-upload.middleware";

let adminPDFController = new AdminPDFController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

 
router.post('/', pdfUpload.single("pdfFile"), adminPDFController.createAdminPDF);
router.get('/', adminPDFController.getAllAdminPDFs);
router.get('/:id', adminPDFController.getAdminPDFById);
router.put('/:id', pdfUpload.single("pdfFile"), adminPDFController.updateAdminPDF);
router.delete('/:id', adminPDFController.deleteAdminPDF);

export default router;
