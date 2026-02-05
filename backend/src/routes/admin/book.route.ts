import { Router } from "express";
import { AdminBookController } from "../../controllers/admin/book.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorization.middleware";
import { uploads } from "../../middlewares/upload.middleware";

let adminBookController = new AdminBookController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post('/', uploads.single("coverImageUrl"), adminBookController.createBook);
router.put('/:id', uploads.single("coverImageUrl"), adminBookController.updateBook);
router.delete('/:id', adminBookController.deleteBook);
router.get('/', adminBookController.getAllBooks);
router.get('/:id', adminBookController.getBookById);

export default router;
