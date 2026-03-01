import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import mongoose from "mongoose";

describe("User Repository Unit Tests", () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("should create a new user", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      countryCode: "+977",
      phone: "9812345678",
      password: "Password123!",
      role: "user" as const, 
    };

    const newUser = await userRepository.createUser(userData);

    expect(newUser).toBeDefined();
    expect(newUser.username).toBe(userData.username);
    expect(newUser.email).toBe(userData.email);
    expect(newUser.phone).toBe(userData.phone);
  });

  test("should get user by email case-insensitively", async () => {
    await UserModel.create({
      username: "caseuser",
      email: "Case@Test.com",
      countryCode: "+977",
      phone: "9812345679",
      password: "Password123!",
      role: "user" as const, 
    });

    const found = await userRepository.getUserByEmail("case@test.com");

    expect(found).toBeDefined();
    expect(found?.email).toBe("Case@Test.com"); 
    expect(found?.username).toBe("caseuser");
  });
});