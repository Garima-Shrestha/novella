import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase() {
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("Database connected successfully");
    }catch(error){
        console.log("Database Error", error);
        process.exit(1);
    }
}


export async function connectDatabaseTest(){
    try {
        await mongoose.connect(MONGODB_URI + "_test");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1);
    }
}