import z from 'zod';

export const loginSchema = z.object({
    email: z.email({message: "Enter a vaild email"}),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
});
export type LoginType = z.infer<typeof loginSchema>; 


export const registerSchema = z.object({
    name: z.string().min(2, {message: "Enter your name"}),
    email: z.email({message: "Enter a valid email"}),
    countryCode: z.string().min(1),  
    // phone: z.string().regex(/^\+\d{8,15}$/, { message: "Enter a valid phone number" })
    phone: z.string().regex(/^\d{8,15}$/, { message: "Enter a valid phone number" }),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
    confirmPassword: z.string().min(8, {message: "Minimum 8 characters"}),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});
export type RegisterType = z.infer<typeof registerSchema>;


// Forget password or sending reset password message
export const forgetPasswordSchema = z.object({
    email: z.email({ message: "Enter a valid email" }),
});
export type ForgetPasswordData = z.infer<typeof forgetPasswordSchema>;


// reset password
export const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, { message: "Minimum 8 characters" }),
    confirmNewPassword: z.string().min(8, { message: "Minimum 8 characters" }),
}).refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;