import { loginUser, registerUser } from '@/lib/api/auth';

jest.mock('@/lib/api/axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

import axios from '@/lib/api/axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('loginUser', () => {
  test('should return data on successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        token: 'fake-token',
        data: { email: 'test@gmail.com' },
      },
    });

    const result = await loginUser({
      email: 'test@gmail.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('fake-token');
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@gmail.com',
      password: 'password123',
    });
  });

  test('should throw error on failed login', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    await expect(
      loginUser({ email: 'test@gmail.com', password: 'wrongpass' })
    ).rejects.toThrow('Invalid credentials');
  });
});

describe('registerUser', () => {
  test('should return data on successful registration', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true, data: { email: 'new@gmail.com' } },
    });

    const result = await registerUser({ email: 'new@gmail.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  test('should throw error on failed registration', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    });

    await expect(registerUser({ email: 'existing@gmail.com', password: 'password123' }))
      .rejects.toThrow('Email already exists');
  });
});