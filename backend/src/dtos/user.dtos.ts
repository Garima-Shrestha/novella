import z from 'zod';
import { UserSchema } from '../types/user.type';

// For register
export const RegisterUserDto = UserSchema.pick(
    {
        username: true,
        email: true,
        phone: true,
        countryCode: true,
        password: true,
        // confirmPassword: true,
    }
// ).extend (   // [yo extend and refine is commented because error was coming in mobile] 
//     {
//         confirmPassword: z.string().min(8),
//     }
// ).refine(
//     (data)=> data.password === data.confirmPassword, 
//     {
//         path: ["confirmPassword"],
//         message: "Password do not match",
//     }
);
export type RegisterUserDto = z.infer<typeof RegisterUserDto>


// for login
export const UpdateUserDto = RegisterUserDto.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const LoginUserDto = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type LoginUserDto = z.infer<typeof LoginUserDto>;