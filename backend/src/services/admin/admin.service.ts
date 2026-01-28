import { UserRepository } from "../../repositories/user.repository";
import bcryptjs from 'bcryptjs';
import { HttpError } from "../../errors/http-error";
import { RegisterUserDto } from "../../dtos/user.dtos";

let userRepository = new UserRepository();
export class AdminUserService {
    async createUser(data: RegisterUserDto){
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if(checkEmail){
            throw new HttpError(409, "Email already in use");
        }

        const checkUsername = await userRepository.getUserByUsername(data.username);
        if (checkUsername){
            throw new HttpError(403,"Username already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password, 10); 
        data.password = hashedPassword; 
        const newUser = await userRepository.createUser(data);

        return newUser;
    }

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if(!user) throw new HttpError(404, "User not found");
        return user;
    }

    async getAllUser(){
        const user = await userRepository.getAllUsers();
        return user;
    }

    async updateOneUser(id: string, data: any) {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpError(404, "User not found");

        if (data.password) {
            const salt = await bcryptjs.genSalt(10);
            data.password = await bcryptjs.hash(data.password, salt);
        }

        const updatedUser = await userRepository.updateOneUser(id, data);
        return updatedUser;
    }

    async deleteOneUser(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpError(404, "User not found");

        const deleted = await userRepository.deleteOneUser(id);
        return deleted;
    }
}