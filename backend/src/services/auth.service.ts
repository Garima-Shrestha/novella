import { RegisterUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dtos";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";

const CLIENT_URL = process.env.CLIENT_URL as string;
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


    
    // Get a user by ID
    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    // Update a user by ID
    async updateUser(userId: string, data: UpdateUserDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(403, "Email already in use");
            }
        }
        if(user.username !== data.username){
            const usernameExists = await userRepository.getUserByUsername(data.username!);
            if(usernameExists){
                throw new HttpError(403, "Username already in use");
            }
        }
        if(user.phone !== data.phone){
            const phoneExists = await userRepository.getUserByPhone(data.phone!);
            if(phoneExists){
                throw new HttpError(403, "Phone number already in use");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateOneUser(userId, data);
        return updatedUser;
    }

    // Change password
    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Verify old password
        const isValid = await bcryptjs.compare(oldPassword, user.password);
        if (!isValid) {
            throw new HttpError(401, "Old password is incorrect");
        }

        // Check if new password is same as old password
        const isSame = await bcryptjs.compare(newPassword, user.password);
        if (isSame) {
            throw new HttpError(400, "New password cannot be the same as the old password");
        }

        // Hash new password and update
        const updatedUser = await this.updateUser(userId, { password: newPassword });
        return updatedUser;
    }

    // Reset Password
    async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

}

