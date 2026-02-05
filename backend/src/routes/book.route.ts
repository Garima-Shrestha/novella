import { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

let bookController = new BookController();
const router = Router();

router.use(authorizedMiddleware); // ensure the user is logged in

// Fetch book by anyone
router.get('/:id', bookController.getBookById); 
router.get('/', bookController.getAllBooks); 


router.use(adminOnlyMiddleware); // only admins can modify books


// Admin routes to create, update and detele book
router.post('/', uploads.single("coverImageUrl"), bookController.createBook);
router.put('/:id', uploads.single("coverImageUrl"), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;
