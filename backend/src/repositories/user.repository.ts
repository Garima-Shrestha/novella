import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;

    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteOneUser(id: string): Promise<boolean | null>;

    getAllUsersPaginated(page: number, size: number, searchTerm?: string): Promise<{ users: IUser[]; total: number }>;
}

export class UserRepository implements IUserRepository {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        // const user = await UserModel.findOne({ username });
        const user = await UserModel.findOne({ username: { $regex: `^${username}$`, $options: "i" } });
        return user;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        // const user = await UserModel.findOne({ email });
        const user = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: "i" } })
        return user;
    }
    async getUserByPhone(phone: string): Promise<IUser | null> {
        return await UserModel.findOne({ phone });
    }

    
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updateUser = await UserModel.findByIdAndUpdate(id, data, {new: true});
        return updateUser;
    }
    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getAllUsersPaginated(
        page: number,
        size: number,
        searchTerm?: string
    ): Promise<{ users: IUser[]; total: number }> {
        const filter: any = {};
        if (searchTerm) {
            filter.$or = [
                { username: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
                { phone: { $regex: searchTerm, $options: "i" } }
            ];
        }

        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .skip((page - 1) * size)
                .limit(size),
            UserModel.countDocuments(filter)
        ]);

        return { users, total };
    }
}