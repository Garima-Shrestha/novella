import { RegisterUserDto, LoginUserDto } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";

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
        const checkPhone = await userRepository.getUserByPhone(data.phone);
        if (checkPhone) {
            throw new HttpError(409, "Phone number already in use");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;
       
        const newUser = await userRepository.createUser(data);
        return newUser;
    }


    // For login
     async loginUser(data: LoginUserDto){
        const existingUser = await userRepository.getUserByEmail(data.email);
        if(!existingUser){
            throw new HttpError(404,"Email not found");
        }
        const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password); // data.password → the plain password submitted by the use, existing.password → the hashed password stored in the database for that user
        if (!isPasswordValid){
            throw new HttpError(401,"Invalid credentials");
        }
        // generate JWT
        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            role: existingUser.role
        }; 
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'}); 
        return{token,existingUser};
    }
}

