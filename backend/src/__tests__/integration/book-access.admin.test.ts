import request from "supertest";
import app from "../../app";
import bcryptjs from "bcryptjs";

import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import { BookModel } from "../../models/book.model";
import { BookAccessModel } from "../../models/book-access.model";
import { AdminPDFModel } from "../../models/admin-pdf.model";

describe("Admin BookAccess Integration Tests", () => {
  const uniq = Date.now();

  const adminUser = {
    username: `admin_access_${uniq}`,
    email: `admin_access_${uniq}@example.com`,
    password: "AdminPass123!",
    role: "admin",
    phone: `97${String(uniq).slice(-8)}`,
    countryCode: "+977",
  };

  const normalUser = {
    username: `user_access_${uniq}`,
    email: `user_access_${uniq}@example.com`,
    password: "UserPass123!",
    role: "user",
    phone: `98${String(uniq).slice(-8)}`,
    countryCode: "+977",
  };

  const testCategory = { name: `AccessCat_${uniq}` };

  let adminToken = "";
  let adminId = "";
  let userId = "";
  let bookId = "";
  let categoryId = "";
  let accessId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: adminUser.email },
        { username: adminUser.username },
        { phone: adminUser.phone },
        { email: normalUser.email },
        { username: normalUser.username },
        { phone: normalUser.phone },
      ],
    });
    await CategoryModel.deleteMany({ name: testCategory.name });
    await BookModel.deleteMany({ title: `Access Admin Book ${uniq}` });
    await BookAccessModel.deleteMany({});
    await AdminPDFModel.deleteMany({}); 

    const adminHashed = await bcryptjs.hash(adminUser.password, 10);
    const admin = await UserModel.create({ ...adminUser, password: adminHashed });
    adminId = admin._id.toString();

    const userHashed = await bcryptjs.hash(normalUser.password, 10);
    const user = await UserModel.create({ ...normalUser, password: userHashed });
    userId = user._id.toString();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    adminToken = loginRes.body.token;

    const cat = await CategoryModel.create({ name: testCategory.name });
    categoryId = cat._id.toString();

    const book = await BookModel.create({
      title: `Access Admin Book ${uniq}`,
      author: "Admin Author",
      genre: categoryId,
      pages: 120,
      price: 12,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "Admin book access test book",
    });
    bookId = book._id.toString();

    await AdminPDFModel.create({
      book: bookId,
      pdfUrl: "/uploads/pdfs/test.pdf",
      isActive: true,
    });
  });

  afterAll(async () => {
    await BookAccessModel.deleteMany({});
    await AdminPDFModel.deleteMany({});
    await BookModel.deleteMany({ _id: bookId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await UserModel.deleteMany({ _id: adminId });
    await UserModel.deleteMany({ _id: userId });
  });

  describe("POST /api/admin/book-access", () => {
    test("should create book access for a user", async () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); 

      const res = await request(app)
        .post("/api/admin/book-access")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          user: userId,
          book: bookId,
          rentedAt: new Date().toISOString(),
          expiresAt,
          isActive: true, 
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");

      accessId = res.body.data?._id?.toString();
      expect(res.body.data).toHaveProperty("pdfUrl");
      expect(res.body.data).toHaveProperty("isActive", true);
    });

    test("should not create duplicate active access for same user+book", async () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

        const res = await request(app)
        .post("/api/admin/book-access")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          user: userId,
          book: bookId,
          rentedAt: new Date().toISOString(), 
          expiresAt,
          isActive: true,
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/admin/book-access", () => {
    test("should fetch all book accesses with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/book-access?page=1&size=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/admin/book-access/:id", () => {
    test("should fetch a book access by id", async () => {
      const res = await request(app)
        .get(`/api/admin/book-access/${accessId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("_id");
    });
  });

  describe("PUT /api/admin/book-access/:id", () => {
    test("should update a book access successfully", async () => {
      const newExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(); 

      const res = await request(app)
        .put(`/api/admin/book-access/${accessId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ expiresAt: newExpires });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("expiresAt");
    });
  });

  describe("GET /api/admin/book-access/:id (Not Found)", () => {
    test("should return 404 for non-existing access id", async () => {
      const res = await request(app)
        .get("/api/admin/book-access/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/admin/book-access/:id", () => {
    test("should delete a book access successfully", async () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

      const createRes = await request(app)
        .post("/api/admin/book-access")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          user: adminId,
          book: bookId,
          rentedAt: new Date().toISOString(),
          expiresAt,
          isActive: true,
        });

      expect(createRes.status).toBe(201);
      const deleteId = createRes.body.data?._id?.toString();

      const res = await request(app)
        .delete(`/api/admin/book-access/${deleteId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existing access id", async () => {
      const res = await request(app)
        .delete("/api/admin/book-access/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/admin/book-access (Search)", () => {
    test("should search book accesses by book title", async () => {
      const res = await request(app)
        .get(`/api/admin/book-access?page=1&size=10&searchTerm=Access Admin Book`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should return empty for unmatched search", async () => {
      const res = await request(app)
        .get("/api/admin/book-access?page=1&size=10&searchTerm=zzznomatchzzz")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("GET /api/admin/book-access/available-books", () => {
    test("should fetch available books for a user", async () => {
      const res = await request(app)
        .get(`/api/admin/book-access/available-books?userId=${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should return 400 if userId is missing", async () => {
      const res = await request(app)
        .get("/api/admin/book-access/available-books")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/admin/book-access (Unauthorized)", () => {
    test("should not allow access without token", async () => {
      const res = await request(app).get("/api/admin/book-access?page=1&size=10");

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/admin/book-access (Validation)", () => {
    test("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/admin/book-access")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ user: userId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/admin/book-access (No PDF)", () => {
    test("should return 404 if no active PDF for book", async () => {
      const newBook = await (await import("../../models/book.model")).BookModel.create({
        title: `No PDF Book ${uniq}`,
        author: "No PDF Author",
        genre: categoryId,
        pages: 100,
        price: 10,
        publishedDate: "2024-01-01",
        coverImageUrl: "/uploads/book.jpg",
        description: "No PDF test",
      });

      const res = await request(app)
        .post("/api/admin/book-access")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          user: userId,
          book: newBook._id.toString(),
          rentedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          isActive: true,
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);

      await (await import("../../models/book.model")).BookModel.deleteOne({ _id: newBook._id });
    });
  });
});