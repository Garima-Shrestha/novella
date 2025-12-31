import { RegisterUserDto, LoginUserDto } from "../dtos/auth.dtos";
import { UserRepository } from "../repositories/auth.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { email } from "zod";

let userRepository = new UserRepository;

export class UserService {
    // For register
    async registerUser(data: RegisterUserDto) {
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if (checkEmail){
            throw new HttpError(409, "Email already in use");
        }
        const checkUsername = await userRepository.getUserByUsername(data.username);
        if(checkUsername){
            throw new HttpError(409, "Username already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;
        const newUser = await userRepository.createUser(data);
    }
}

