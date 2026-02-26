import { Router } from "express";
import { BookAccessController } from "../controllers/book-access.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

let bookAccessController = new BookAccessController();
const router = Router();

router.use(authorizedMiddleware); 

router.post('/rent/:bookId', bookAccessController.rentBook);
router.get('/my-library', bookAccessController.getMyLibrary);  // my library
router.get('/history', bookAccessController.getMyHistory);     // history
router.get('/', bookAccessController.getUserBooks);
router.get('/:bookId', bookAccessController.getUserBookById);

router.post('/:bookId/bookmarks', bookAccessController.addBookmark);
router.delete('/:bookId/bookmarks', bookAccessController.removeBookmark);
router.post('/:bookId/quotes', bookAccessController.addQuote);
router.delete('/:bookId/quotes', bookAccessController.removeQuote);
router.patch('/:bookId/last-position', bookAccessController.updateLastPosition);

export default router;
