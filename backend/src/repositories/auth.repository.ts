import { IUser, UserModel } from "../models/auth.model";

export interface IUserRepository {
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ username });
        return user;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ email });
        return user;
    }
    async getUserByPhone(phone: string): Promise<IUser | null> {
        return await UserModel.findOne({ phone });
    }
}