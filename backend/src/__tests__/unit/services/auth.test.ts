import { UserService } from "../../../services/auth.service";
import { UserRepository } from "../../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config/email");

describe("UserService Unit Tests", () => {
  let userService: UserService;

  const getUserByEmailSpy = jest.spyOn(UserRepository.prototype, "getUserByEmail");
  const getUserByUsernameSpy = jest.spyOn(UserRepository.prototype, "getUserByUsername");
  const getUserByPhoneSpy = jest.spyOn(UserRepository.prototype, "getUserByPhone");
  const getUserByIdSpy = jest.spyOn(UserRepository.prototype, "getUserById");
  const createUserSpy = jest.spyOn(UserRepository.prototype, "createUser");
  const updateOneUserSpy = jest.spyOn(UserRepository.prototype, "updateOneUser");

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  test("registerUser - should register a new user successfully", async () => {
    getUserByEmailSpy.mockResolvedValue(null);
    getUserByUsernameSpy.mockResolvedValue(null);
    getUserByPhoneSpy.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const mockUser = { _id: "u1", username: "testuser", email: "test@example.com" };
    createUserSpy.mockResolvedValue(mockUser as any);

    const result = await userService.registerUser({
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
      phone: "9812345678",
      countryCode: "+977",
    });

    expect(result).toEqual(mockUser);
    expect(createUserSpy).toHaveBeenCalledTimes(1);
  });

  test("registerUser - should throw 409 if email already exists", async () => {
    getUserByEmailSpy.mockResolvedValue({ email: "test@example.com" } as any);

    await expect(
      userService.registerUser({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        phone: "9812345678",
        countryCode: "+977",
      })
    ).rejects.toThrow("Email already in use");

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  test("registerUser - should throw 409 if username already exists", async () => {
    getUserByEmailSpy.mockResolvedValue(null);
    getUserByUsernameSpy.mockResolvedValue({ username: "testuser" } as any);

    await expect(
      userService.registerUser({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        phone: "9812345678",
        countryCode: "+977",
      })
    ).rejects.toThrow("Username already in use");

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  test("registerUser - should throw 409 if phone already exists", async () => {
    getUserByEmailSpy.mockResolvedValue(null);
    getUserByUsernameSpy.mockResolvedValue(null);
    getUserByPhoneSpy.mockResolvedValue({ phone: "9812345678" } as any);

    await expect(
      userService.registerUser({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        phone: "9812345678",
        countryCode: "+977",
      })
    ).rejects.toThrow("Phone number already in use");

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  test("loginUser - should return token and user on valid credentials", async () => {
    const mockUser = {
      _id: "u1",
      email: "test@example.com",
      password: "hashedPassword",
      role: "user",
    };
    getUserByEmailSpy.mockResolvedValue(mockUser as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked.jwt.token");

    const result = await userService.loginUser({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result).toHaveProperty("token", "mocked.jwt.token");
    expect(result).toHaveProperty("existingUser", mockUser);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("loginUser - should throw 404 if email not found", async () => {
    getUserByEmailSpy.mockResolvedValue(null);

    await expect(
      userService.loginUser({ email: "notfound@example.com", password: "Password123!" })
    ).rejects.toThrow("Email not found");

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test("loginUser - should throw 401 if password is incorrect", async () => {
    getUserByEmailSpy.mockResolvedValue({
      email: "test@example.com",
      password: "hashedPassword",
    } as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.loginUser({ email: "test@example.com", password: "WrongPass!" })
    ).rejects.toThrow("Invalid credentials");

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test("changePassword - should change password successfully", async () => {
    const mockUser = { _id: "u1", password: "oldHashed" };
    getUserByIdSpy.mockResolvedValue(mockUser as any);
    (bcryptjs.compare as jest.Mock)
      .mockResolvedValueOnce(true)   
      .mockResolvedValueOnce(false); 
    (bcryptjs.hash as jest.Mock).mockResolvedValue("newHashed");
    updateOneUserSpy.mockResolvedValue({ ...mockUser, password: "newHashed" } as any);

    const result = await userService.changePassword("u1", "OldPass123!", "NewPass123!");

    expect(result).toBeDefined();
    expect(bcryptjs.hash).toHaveBeenCalledTimes(1);
    expect(updateOneUserSpy).toHaveBeenCalledTimes(1);
  });

  test("changePassword - should throw 401 if old password is wrong", async () => {
    getUserByIdSpy.mockResolvedValue({ _id: "u1", password: "hashedOld" } as any);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.changePassword("u1", "WrongOld!", "NewPass123!")
    ).rejects.toThrow("Old password is incorrect");

    expect(updateOneUserSpy).not.toHaveBeenCalled();
  });

  test("1changePassword - should throw 400 if new password is same as old", async () => {
    getUserByIdSpy.mockResolvedValue({ _id: "u1", password: "hashedPassword" } as any);
    (bcryptjs.compare as jest.Mock)
      .mockResolvedValueOnce(true)  
      .mockResolvedValueOnce(true); 

    await expect(
      userService.changePassword("u1", "SamePass123!", "SamePass123!")
    ).rejects.toThrow("New password cannot be the same as the old password");

    expect(updateOneUserSpy).not.toHaveBeenCalled();
  });
});