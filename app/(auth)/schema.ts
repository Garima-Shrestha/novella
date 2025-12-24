import z, { email } from 'zod';

export const loginSchema = z.object({
    email: z.email({message: "Enter a vaild email"}),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
});
export type LoginType = z.infer<typeof loginSchema>; 

export const registerSchema = z.object({
    name: z.string().min(2, {message: "Enter your name"}),
    email: z.email({message: "Enter a valid email"}),
    phone: z.string().regex(/^\d{10}$/, { message: "Enter a valid phone number" }),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
    confirmPassword: z.string().min(8, {message: "Minimum 8 characters"}),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});
export type RegisterType = z.infer<typeof registerSchema>;