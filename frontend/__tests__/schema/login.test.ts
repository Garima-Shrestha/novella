import { loginSchema } from '@/app/(auth)/schema';

describe('loginSchema', () => {
  test('should pass with valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'test@gmail.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  test('should fail with invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalidemail',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Enter a vaild email');
  });

  test('should fail when password is less than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'test@gmail.com',
      password: 'abc',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Minimum 8 characters');
  });
});