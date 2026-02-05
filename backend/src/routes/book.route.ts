import { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

let bookController = new BookController();
const router = Router();

router.use(authorizedMiddleware); // ensure the user is logged in


router.get('/:id', bookController.getBookById); 
router.get('/', bookController.getAllBooks); 

export default router;
