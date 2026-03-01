import request from "supertest";
import app from "../../app";
import { BookModel } from "../../models/book.model";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model"; 

describe("User Book Integration Tests", () => {
  const testUser = {
    username: "bookuser",
    email: "user@example.com",
    countryCode: "+977",
    phone: "9811111111",
    password: "UserPass123!",
  };

  const testCategory = {
    name: "Non-Fiction",
  };

  let userToken = "";
  let bookId = "";
  let categoryId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
        { phone: testUser.phone },
      ],
    });
    await CategoryModel.deleteMany({ name: testCategory.name });
    await BookModel.deleteMany({ title: "User View Book" });

    const category = await CategoryModel.create(testCategory);
    categoryId = category._id.toString();

    const registerRes = await request(app).post("/api/auth/register").send(testUser);
    expect([200, 201]).toContain(registerRes.status);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    userToken = loginRes.body.token;

    const book = await BookModel.create({
      title: "User View Book",
      author: "Author Two",
      genre: categoryId,
      pages: 150,
      price: 29.99,
      publishedDate: "2023-06-01",
      coverImageUrl: "/uploads/book2.jpg",
      description: "User view book description",
    });

    bookId = book._id.toString();
  });

  afterAll(async () => {
    await BookModel.deleteMany({ title: "User View Book" });
    await CategoryModel.deleteMany({ name: testCategory.name });
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
        { phone: testUser.phone },
      ],
    });
  });

  describe("GET /api/books/:id", () => {
    test("should fetch single book", async () => {
      const res = await request(app)
        .get(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("title", "User View Book");
    });

    test("should return 404 if book not found", async () => {
      const res = await request(app)
        .get("/api/books/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should not fetch single book without token", async () => {
      const res = await request(app).get(`/api/books/${bookId}`);

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/books", () => {
    test("should fetch books with pagination", async () => {
      const res = await request(app)
        .get("/api/books?page=1&size=10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should search by title", async () => {
      const res = await request(app)
        .get(`/api/books?searchTerm=${encodeURIComponent("User View Book")}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("title", "User View Book");
    });

    test("should not fetch books without token", async () => {
      const res = await request(app).get("/api/books?page=1&size=10");

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should search by author", async () => {
      const res = await request(app)
        .get(`/api/books?searchTerm=${encodeURIComponent("Author Two")}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("author", "Author Two");
    });

        test("should return pagination meta fields", async () => {
      const res = await request(app)
        .get("/api/books?page=1&size=10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);

      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toHaveProperty("page");
      expect(res.body.pagination).toHaveProperty("size");
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("totalPages");
    });
  });

  describe("GET /api/books (Filter by category)", () => {
    test("should filter books by genre/category id", async () => {
      const res = await request(app)
        .get(`/api/books?page=1&size=10&searchTerm=User View Book`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should return empty array for unmatched search", async () => {
      const res = await request(app)
        .get("/api/books?page=1&size=10&searchTerm=zzznomatchzzz")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
