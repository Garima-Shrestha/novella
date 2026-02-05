import express, { Application } from "express";
import bodyParser from 'body-parser';
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';


import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import bookRoutes from './routes/book.route';

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

async function start() {
    await connectDatabase();
    
    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    })
}

start().catch((error) => console.log(error));