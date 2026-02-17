import express, { Application } from "express";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';


import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin/admin.route';
import bookRoutes from './routes/book.route';
import adminBookRoutes from './routes/admin/book.route';
import categoryRoutes from './routes/category.route';
import adminCategoryRoutes from './routes/admin/category.route';
import bookAccessRoutes from './routes/book-access.route';
import adminBookAccessRoutes from './routes/admin/book-access.route'; 
import adminPDFRoutes from './routes/admin/admin-pdf.route';

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();


let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3003"],

}
app.use(cors(corsOptions));


// Image
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // static file serving


app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminRoutes);
app.use('/api/books', bookRoutes); 
app.use('/api/admin/books', adminBookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/book-access', bookAccessRoutes);
app.use('/api/admin/book-access', adminBookAccessRoutes);
app.use('/api/admin/admin-pdf', adminPDFRoutes);

export default app;