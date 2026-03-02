import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/app/(auth)/_components/LoginForm';

jest.mock('@/lib/actions/auth-action', () => ({
  handleLogin: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    checkAuth: jest.fn(),
    user: null,
    loading: false,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

import { handleLogin } from '@/lib/actions/auth-action';
const mockedHandleLogin = handleLogin as jest.MockedFunction<typeof handleLogin>;

describe('LoginForm', () => {
  test('should render email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('example@gmail.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should show validation error for invalid email', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText('example@gmail.com'), 'invalidemail');
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter a vaild email')).toBeInTheDocument();
    });
  });

  test('should show validation error when password is too short', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText('example@gmail.com'), 'test@gmail.com');
    await userEvent.type(screen.getByPlaceholderText('********'), 'abc');
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument();
    });
  });

  test('should call handleLogin with correct data on valid submit', async () => {
    mockedHandleLogin.mockResolvedValueOnce({ success: true, message: 'Login successful' });

    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText('example@gmail.com'), 'test@gmail.com');
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockedHandleLogin).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        password: 'password123',
      });
    });
  });

  test('should display error message when login fails', async () => {
    mockedHandleLogin.mockResolvedValueOnce({
      success: false,
      message: 'Invalid credentials',
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText('example@gmail.com'), 'test@gmail.com');
    await userEvent.type(screen.getByPlaceholderText('********'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});