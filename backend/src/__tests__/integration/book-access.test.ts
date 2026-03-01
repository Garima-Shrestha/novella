import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import { BookModel } from "../../models/book.model";
import { BookAccessModel } from "../../models/book-access.model";
import bcryptjs from "bcryptjs";

describe("User BookAccess Integration Tests", () => {
  const uniq = Date.now();

  const testUser = {
    username: `accessuser_${uniq}`,
    email: `access_${uniq}@example.com`,
    password: "UserPass123!",
    phone: `98${String(uniq).slice(-8)}`, 
    countryCode: "+977",
  };

  const testCategory = {
    name: `AccessCategory_${uniq}`,
  };

  let userToken = "";
  let userId = "";
  let bookId = "";
  let categoryId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [{ email: testUser.email }, { username: testUser.username }, { phone: testUser.phone }],
    });
    await CategoryModel.deleteMany({ name: testCategory.name });
    await BookModel.deleteMany({ title: `Access Book ${uniq}` });
    await BookAccessModel.deleteMany({});

    const hashedPassword = await bcryptjs.hash(testUser.password, 10);
    const user = await UserModel.create({ ...testUser, password: hashedPassword });
    userId = user._id.toString();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    userToken = loginRes.body.token;

    const category = await CategoryModel.create({ name: testCategory.name });
    categoryId = category._id.toString();

    const book = await BookModel.create({
      title: `Access Book ${uniq}`,
      author: "Author Access",
      genre: categoryId,
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "BookAccess testing book",
    });
    bookId = book._id.toString();

    await BookAccessModel.create({
      user: userId,
      book: bookId,
      rentedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), 
      isActive: true,
      pdfUrl: "/uploads/pdfs/test.pdf",
      bookmarks: [],
      quotes: [],
      lastPosition: { page: 1, offsetY: 0, zoom: 1 },
    });
  });

  afterAll(async () => {
    await BookAccessModel.deleteMany({ user: userId });
    await BookModel.deleteMany({ _id: bookId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await UserModel.deleteMany({ _id: userId });
  });

  describe("GET /api/book-access", () => {
    test("should fetch user rented books with pagination", async () => {
      const res = await request(app)
        .get("/api/book-access?page=1&size=10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/book-access/:bookId", () => {
    test("should fetch a specific rented book access by bookId", async () => {
      const res = await request(app)
        .get(`/api/book-access/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("book");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data).toHaveProperty("isActive", true);
    });
  });

  describe("POST /api/book-access/:bookId/bookmarks", () => {
    test("should add a bookmark to the rented book", async () => {
      const res = await request(app)
        .post(`/api/book-access/${bookId}/bookmarks`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ page: 2, text: "My bookmark text" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("bookmarks");
      expect(Array.isArray(res.body.data.bookmarks)).toBe(true);
      expect(res.body.data.bookmarks.length).toBeGreaterThan(0);
      expect(res.body.data.bookmarks[0]).toHaveProperty("page", 2);
    });
  });

  describe("DELETE /api/book-access/:bookId/bookmarks", () => {
    test("should remove a bookmark by index", async () => {
      await request(app)
        .post(`/api/book-access/${bookId}/bookmarks`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ page: 3, text: "Bookmark to remove" });

      const res = await request(app)
        .delete(`/api/book-access/${bookId}/bookmarks`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ index: 0 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("bookmarks");
      expect(Array.isArray(res.body.data.bookmarks)).toBe(true);
    });
  });

  describe("PATCH /api/book-access/:bookId/last-position", () => {
    test("should update last reading position", async () => {
      const res = await request(app)
        .patch(`/api/book-access/${bookId}/last-position`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ page: 5, offsetY: 250, zoom: 1.2 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("lastPosition");
      expect(res.body.data.lastPosition).toHaveProperty("page", 5);
      expect(res.body.data.lastPosition).toHaveProperty("offsetY", 250);
    });
  });

  describe("GET /api/book-access (Unauthorized)", () => {
    test("should not allow access without token", async () => {
      const res = await request(app).get("/api/book-access?page=1&size=10");

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/book-access/:bookId (Not Found)", () => {
    test("should return 404 for book not rented", async () => {
      const res = await request(app)
        .get("/api/book-access/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/book-access/:bookId/bookmarks (Unauthorized)", () => {
    test("should not allow adding bookmark without token", async () => {
      const res = await request(app)
        .post(`/api/book-access/${bookId}/bookmarks`)
        .send({ page: 2, text: "Unauthorized bookmark" });

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PATCH /api/book-access/:bookId/last-position (Unauthorized)", () => {
    test("should not allow updating position without token", async () => {
      const res = await request(app)
        .patch(`/api/book-access/${bookId}/last-position`)
        .send({ page: 5, offsetY: 250, zoom: 1.2 });

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/book-access (My Library)", () => {
    test("should fetch user library", async () => {
      const res = await request(app)
        .get("/api/book-access/my-library?page=1&size=10")
        .set("Authorization", `Bearer ${userToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe("DELETE /api/book-access/:bookId/bookmarks (Not Found)", () => {
    test("should handle removing bookmark from non-rented book", async () => {
      const res = await request(app)
        .delete("/api/book-access/64f0f0f0f0f0f0f0f0f0f0f0/bookmarks")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ index: 0 });

      expect([200, 404]).toContain(res.status);
    });
  });
});