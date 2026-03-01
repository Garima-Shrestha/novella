import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import bcryptjs from "bcryptjs";

describe("User Category Integration Tests", () => {
  const testUser = {
    username: "user123",
    email: "user@example.com",
    password: "UserPass123!",
    phone: "9812345678",
    countryCode: "+977",
  };

  let userToken = "";
  let categoryId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    await CategoryModel.deleteMany();

    const hashedPassword = await bcryptjs.hash(testUser.password, 10);
    await UserModel.create({ ...testUser, password: hashedPassword });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    userToken = loginRes.body.token;

    const category = await CategoryModel.create({ name: "UserCategory" });
    categoryId = category._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    await CategoryModel.deleteMany();
  });

  test("GET /api/categories - fetch all active categories", async () => {
    const res = await request(app)
      .get("/api/categories")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/categories/:id - fetch single category by ID", async () => {
    const res = await request(app)
      .get(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("name", "UserCategory");
  });

  test("GET /api/categories - should not allow access without token", async () => {
    const res = await request(app).get("/api/categories");

    expect([401, 403]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
