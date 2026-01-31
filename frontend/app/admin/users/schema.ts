import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const UserSchema = z.object({
    username: z.string().min(2, { message: "Username must be at least 2 characters" }),
    email: z.email({ message: "Enter a valid email" }),
    countryCode: z.string().regex(/^\+\d{1,3}$/, {message: "Country code must be like +1, +91",}),
    phone: z.string().regex(/^\d{8,15}$/, {message: "Phone number must be 8-15 digits",}),
    password: z.string().min(8, { message: "Minimum 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Minimum 8 characters" }),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type UserData = z.infer<typeof UserSchema>;

export const UserEditSchema = UserSchema.partial()
export type UserEditData = z.infer<typeof UserEditSchema>;

