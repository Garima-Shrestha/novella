import { AdminUserService } from "../../../services/admin/admin.service";
import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import bcryptjs from "bcryptjs";

jest.mock("bcryptjs");
jest.mock("../../../models/user.model");

describe("AdminUserService Unit Tests", () => {
  let adminUserService: AdminUserService;

  const getUserByEmailSpy = jest.spyOn(UserRepository.prototype, "getUserByEmail");
  const getUserByUsernameSpy = jest.spyOn(UserRepository.prototype, "getUserByUsername");
  const getUserByIdSpy = jest.spyOn(UserRepository.prototype, "getUserById");
  const createUserSpy = jest.spyOn(UserRepository.prototype, "createUser");
  const updateOneUserSpy = jest.spyOn(UserRepository.prototype, "updateOneUser");
  const deleteOneUserSpy = jest.spyOn(UserRepository.prototype, "deleteOneUser");
  const getAllUsersPaginatedSpy = jest.spyOn(UserRepository.prototype, "getAllUsersPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    adminUserService = new AdminUserService();
  });

  test("createUser - should create a new user successfully", async () => {
    getUserByEmailSpy.mockResolvedValue(null);
    getUserByUsernameSpy.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");
    const mockUser = { _id: "u1", username: "newuser", email: "new@example.com" };
    createUserSpy.mockResolvedValue(mockUser as any);

    const result = await adminUserService.createUser({
      username: "NewUser",
      email: "New@Example.com",
      password: "Password123!",
      phone: "9812345678",
      countryCode: "+977",
    });

    expect(result).toEqual(mockUser);
    expect(createUserSpy).toHaveBeenCalledTimes(1);
  });

  test("createUser - should throw 409 if email already exists", async () => {
    getUserByEmailSpy.mockResolvedValue({ email: "new@example.com" } as any);

    await expect(
      adminUserService.createUser({
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        phone: "9812345678",
        countryCode: "+977",
      })
    ).rejects.toThrow("Email already in use");

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  test("createUser - should throw 403 if username already exists", async () => {
    getUserByEmailSpy.mockResolvedValue(null);
    getUserByUsernameSpy.mockResolvedValue({ username: "newuser" } as any);

    await expect(
      adminUserService.createUser({
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        phone: "9812345678",
        countryCode: "+977",
      })
    ).rejects.toThrow("Username already in use");

    expect(createUserSpy).not.toHaveBeenCalled();
  });

  test("getUserById - should return user if found", async () => {
    const mockUser = { _id: "u1", username: "testuser", email: "test@example.com" };
    getUserByIdSpy.mockResolvedValue(mockUser as any);

    const result = await adminUserService.getUserById("u1");

    expect(result).toEqual(mockUser);
    expect(getUserByIdSpy).toHaveBeenCalledWith("u1");
  });

  test("getUserById - should throw 404 if user not found", async () => {
    getUserByIdSpy.mockResolvedValue(null);

    await expect(adminUserService.getUserById("nonexistent")).rejects.toThrow("User not found");
  });

  test("updateOneUser - should update user successfully", async () => {
    const mockUser = { _id: "u1", username: "olduser", email: "old@example.com" };
    const updatedMock = { _id: "u1", username: "olduser", email: "updated@example.com" };
    getUserByIdSpy.mockResolvedValue(mockUser as any);
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    updateOneUserSpy.mockResolvedValue(updatedMock as any);

    const result = await adminUserService.updateOneUser("u1", { email: "updated@example.com" });

    expect(result).toEqual(updatedMock);
    expect(updateOneUserSpy).toHaveBeenCalledTimes(1);
  });

  test("deleteOneUser - should delete user successfully", async () => {
    const mockUser = { _id: "u1", username: "testuser" };
    getUserByIdSpy.mockResolvedValue(mockUser as any);
    deleteOneUserSpy.mockResolvedValue(mockUser as any);

    const result = await adminUserService.deleteOneUser("u1");

    expect(result).toEqual(mockUser);
    expect(deleteOneUserSpy).toHaveBeenCalledWith("u1");
  });

  test("getAllUsersPaginated - should return users with pagination meta", async () => {
    const mockUsers = [
      { _id: "u1", username: "user1" },
      { _id: "u2", username: "user2" },
    ];
    getAllUsersPaginatedSpy.mockResolvedValue({ users: mockUsers, total: 2 } as any);

    const result = await adminUserService.getAllUsersPaginated("1", "10");

    expect(result).toHaveProperty("users");
    expect(result).toHaveProperty("pagination");
    expect(result.pagination).toEqual({ page: 1, size: 10, total: 2, totalPages: 1 });
    expect(result.users).toHaveLength(2);
  });
});