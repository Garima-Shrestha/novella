import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema ({
    username: { type: String, required: true, unique: true, minLength:2 },
    email: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true, match: [/^\+\d{1,3}$/, "Invalid country code"] },
    phone: { type: String, required: true, unique:true, match: [/^\d{8,15}$/, "Invalid phone number"]},
    password: { type: String, required: true, minLength:8 },
    role: { type: String, enum: [ "admin", "user" ], default: "user"},
}, {
    timestamps: true, 
});

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);