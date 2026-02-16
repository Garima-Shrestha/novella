import { Router } from "express";
import { BookAccessController } from "../controllers/book-access.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

let bookAccessController = new BookAccessController();
const router = Router();

router.use(authorizedMiddleware); 

router.post('/rent/:bookId', bookAccessController.rentBook);
router.get('/', bookAccessController.getUserBooks);
router.get('/:bookId', bookAccessController.getUserBookById);
router.put('/:bookId', bookAccessController.updateBookAccess);
router.post('/return/:bookId', bookAccessController.returnBook);

export default router;
