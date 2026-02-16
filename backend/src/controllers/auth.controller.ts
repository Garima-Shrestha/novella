import { LoginUserDto, RegisterUserDto, UpdateUserDto } from "../dtos/user.dtos";
import { UserService } from "../services/auth.service";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();
export class AuthController {
    // For register
    async register(req: Request, res: Response){
        try {
            const parsedData = RegisterUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json (
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const newUser = await userService.registerUser(parsedData.data);
            return res.status(201).json( // 201 Created
                { success: true, data: newUser, message: "Register success" }
            );
        }catch(error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error"}
            );
        }
    }


    // For login
    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if(!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const { token, existingUser } = await userService.loginUser(parsedData.data);
            return res.status(200).json(
                { success: true, data: existingUser, token, message: "Login success" }
            );
        } catch (error: Error | any ) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error"}
            );
        }
    }


    // Get the logged-in user's profile
    async getProfile(req: Request, res: Response) {
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User profile fetched successfully" }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    // Update the logged-in user's profile
    async updateProfile(req: Request, res: Response) {
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            if(req.file){
                parsedData.data.imageUrl = `/uploads/images/${req.file.filename}`;
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User profile updated successfully" }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    // Change Password
    async changePassword(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "User Id not found" });
            }

            const { oldPassword, password } = req.body;
            if (!oldPassword || !password) {
                return res.status(400).json({ success: false, message: "Old password and new password are required" });
            }

            const updatedUser = await userService.changePassword(userId, oldPassword, password);

            return res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    // // Send Reset Password message
    // async sendResetPasswordEmail(req: Request, res: Response) {
    //     try {
    //         const email = req.body.email;
    //         const user = await userService.sendResetPasswordEmail(email);
    //         return res.status(200).json(
    //             { success: true,
    //                 data: user,
    //                 message: "If the email is registered, a reset link has been sent." }
    //         );
    //     } catch (error: Error | any) {
    //         return res.status(error.statusCode ?? 500).json(
    //             { success: false, message: error.message || "Internal Server Error" }
    //         );
    //     }
    // }


    // Send Reset Password message
    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const redirectUrl = req.body.redirectUrl;  // for flutter
            const user = await userService.sendResetPasswordEmail(email, redirectUrl);
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    // Reset Password
    async resetPassword(req: Request, res: Response) {
        try {
            const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
} 