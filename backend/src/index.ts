import express, { Application } from "express";
import bodyParser from 'body-parser';
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import dotenv from "dotenv";

import authRoutes from './routes/auth.route';

dotenv.config();
console.log(process.env.PORT);

const app: Application = express();

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);

async function start() {
    await connectDatabase();
    
    app.listen(PORT, () => {
        console.log(`Server: http://localhost:${PORT}`);
    })
}

start().catch((error) => console.log(error));