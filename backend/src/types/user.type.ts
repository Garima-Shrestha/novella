import z from 'zod';

export const UserSchema = z.object ({
    username: z.string().min(2),
    email: z.string().email(),
    countryCode: z.string().regex(/^\+\d{1,3}$/),
    phone: z.string().regex(/^\d{8,15}$/),
    password: z.string().min(8),
    role: z.enum(['admin', 'user']).default('user'),
    imageUrl: z.string().optional() 
});

export type UserType = z. infer<typeof UserSchema>;