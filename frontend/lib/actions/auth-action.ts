// server side processing
"use server"

import { registerUser } from "../api/auth"

export const handleRegister = async(formData: any) => {
    try {
        const result = await registerUser(formData);
        if(result.success) {
            return {
                success: true,
                message: "Registration successful",
                data: result.data
            };
        } 
        return {
            success: false,
            message: result.message || "Registration failed"
        }
    } catch(err: Error | any) {
        return {
            success: false, message: err.message || "Registration failed"
        }
    }
}
