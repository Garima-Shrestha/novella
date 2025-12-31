import z from 'zod';

export const UserSchema = z.object ({
    username: z.string().min(2),
    email: z.email(),
    phone: z.string().regex(/^\+?\d{10,15}$/), 
    password: z.string().min(8),
    role: z.enum(['admin', 'user']).default('user'),
});

export type UserType = z. infer<typeof UserSchema>;