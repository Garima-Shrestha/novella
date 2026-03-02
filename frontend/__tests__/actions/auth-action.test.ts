import { handleLogin, handleRegister, handleRequestPasswordReset, handleResetPassword } from '@/lib/actions/auth-action';

jest.mock('@/lib/api/auth', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
}));

jest.mock('@/lib/cookie', () => ({
  setAuthToken: jest.fn(),
  setUserData: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { loginUser, registerUser, requestPasswordReset, resetPassword } from '@/lib/api/auth';
import { setAuthToken, setUserData } from '@/lib/cookie';

const mockedLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockedRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;
const mockedRequestPasswordReset = requestPasswordReset as jest.MockedFunction<typeof requestPasswordReset>;
const mockedResetPassword = resetPassword as jest.MockedFunction<typeof resetPassword>;
const mockedSetAuthToken = setAuthToken as jest.MockedFunction<typeof setAuthToken>;
const mockedSetUserData = setUserData as jest.MockedFunction<typeof setUserData>;

describe('handleLogin', () => {
  test('should return success and set cookies on successful login', async () => {
    mockedLoginUser.mockResolvedValueOnce({
      success: true,
      token: 'fake-token',
      data: { email: 'test@gmail.com' },
    });
    mockedSetAuthToken.mockResolvedValueOnce(undefined);
    mockedSetUserData.mockResolvedValueOnce(undefined);

    const result = await handleLogin({
      email: 'test@gmail.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');
    expect(mockedSetAuthToken).toHaveBeenCalledWith('fake-token');
  });

  test('should return failure when login fails', async () => {
    mockedLoginUser.mockResolvedValueOnce({
      success: false,
      message: 'Invalid credentials',
    });

    const result = await handleLogin({
      email: 'test@gmail.com',
      password: 'wrongpass',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  test('should return failure when loginUser throws', async () => {
    mockedLoginUser.mockRejectedValueOnce(new Error('Network error'));

    const result = await handleLogin({
      email: 'test@gmail.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
  });
});

describe('handleRegister', () => {
  test('should return success on successful registration', async () => {
    mockedRegisterUser.mockResolvedValueOnce({
      success: true,
      data: { email: 'new@gmail.com' },
    });

    const result = await handleRegister({
      email: 'new@gmail.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Registration successful');
  });

  test('should return failure on failed registration', async () => {
    mockedRegisterUser.mockResolvedValueOnce({
      success: false,
      message: 'Email already exists',
    });

    const result = await handleRegister({
      email: 'existing@gmail.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email already exists');
  });
});

describe('handleRequestPasswordReset', () => {
  test('should return success when reset email is sent', async () => {
    mockedRequestPasswordReset.mockResolvedValueOnce({
      success: true,
    });

    const result = await handleRequestPasswordReset('test@gmail.com');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Password reset email sent successfully');
  });

  test('should return failure when reset email fails', async () => {
    mockedRequestPasswordReset.mockResolvedValueOnce({
      success: false,
      message: 'Email not found',
    });

    const result = await handleRequestPasswordReset('notfound@gmail.com');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email not found');
  });
});

describe('handleResetPassword', () => {
  test('should return success on successful password reset', async () => {
    mockedResetPassword.mockResolvedValueOnce({
      success: true,
    });

    const result = await handleResetPassword('valid-token', 'newpassword123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Password has been reset successfully');
  });

  test('should return failure on failed password reset', async () => {
    mockedResetPassword.mockResolvedValueOnce({
      success: false,
      message: 'Invalid or expired token',
    });

    const result = await handleResetPassword('expired-token', 'newpassword123');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid or expired token');
  });
});