import z from "zod";
import { RegisterUserDto } from "../../dtos/user.dtos";
import { AdminUserService } from "../../services/admin/admin.service";
import { Request, Response } from "express";


let adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req: Request, res: Response ){
         try {
            const parsedData = RegisterUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json (
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            if (req.file) {
                parsedData.data.imageUrl = `/uploads/images/${req.file.filename}`;
            }
            
            const newUser = await adminUserService.createUser(parsedData.data);
            return res.status(201).json( // 201 Created
                { success: true, data: newUser, message: "Register success" }
            );
        }catch(error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error"}
            );
        }
    }
    async getUserById(req: Request, res: Response ){
        try {
            const userId = req.params.id; // from url /api/admin/users/:id
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User Fetched"}
            )
        }catch(error: Error | any ){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error"}
            );
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, size, searchTerm } = req.query as any;
            const { users, pagination } = await adminUserService.getAllUsersPaginated(page, size, searchTerm);
            return res.status(200).json({
                success: true,
                data: users,
                pagination,
                message: "Users fetched successfully"
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // PUT /api/admin/users/:id
    async updateOneUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            if (req.file) {
                req.body.imageUrl = `/uploads/${req.file.filename}`;
            }
            const updatedUser = await adminUserService.updateOneUser(userId, req.body);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "User Updated Successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // DELETE /api/admin/users/:id
    async deleteOneUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            await adminUserService.deleteOneUser(userId);
            return res.status(200).json({
                success: true,
                message: "User Deleted Successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}