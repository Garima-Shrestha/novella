import request from "supertest";
import app from "../../app";
import bcryptjs from "bcryptjs";
import path from "path";
import fs from "fs";

import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import { BookModel } from "../../models/book.model";
import { AdminPDFModel } from "../../models/admin-pdf.model";

describe("Admin PDF Integration Tests", () => {
  const uniq = Date.now();

  const adminUser = {
    username: `adminpdf_${uniq}`,
    email: `adminpdf_${uniq}@example.com`,
    password: "AdminPass123!",
    role: "admin",
    phone: `97${String(uniq).slice(-8)}`,
    countryCode: "+977",
  };

  const testCategory = { name: `PdfCat_${uniq}` };

  let adminToken = "";
  let adminId = "";
  let bookId = "";
  let categoryId = "";
  let pdfId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email: adminUser.email });
    await CategoryModel.deleteMany({ name: testCategory.name });
    await BookModel.deleteMany({ title: `PDF Book ${uniq}` });
    await AdminPDFModel.deleteMany({});

    const hashed = await bcryptjs.hash(adminUser.password, 10);
    const admin = await UserModel.create({ ...adminUser, password: hashed });
    adminId = admin._id.toString();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    adminToken = loginRes.body.token;

    const cat = await CategoryModel.create({ name: testCategory.name });
    categoryId = cat._id.toString();

    const book = await BookModel.create({
      title: `PDF Book ${uniq}`,
      author: "PDF Author",
      genre: categoryId,
      pages: 90,
      price: 9,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "PDF test book",
    });
    bookId = book._id.toString();

    const pdf = await AdminPDFModel.create({
      book: bookId,
      pdfUrl: "/uploads/pdfs/test.pdf",
      isActive: true,
    });
    pdfId = pdf._id.toString();
  });

  afterAll(async () => {
    await AdminPDFModel.deleteMany({});
    await BookModel.deleteMany({ _id: bookId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await UserModel.deleteMany({ _id: adminId });
  });

  describe("GET /api/admin/admin-pdf", () => {
    test("should fetch pdf list with pagination", async () => {
      const res = await request(app)
        .get("/api/admin/admin-pdf?page=1&size=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should search pdf by book title", async () => {
      const res = await request(app)
        .get(`/api/admin/admin-pdf?page=1&size=10&searchTerm=PDF Book`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should return empty for unmatched search", async () => {
      const res = await request(app)
        .get("/api/admin/admin-pdf?page=1&size=10&searchTerm=zzznomatchzzz")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveLength(0);
    });

    test("should not allow access without token", async () => {
      const res = await request(app).get("/api/admin/admin-pdf?page=1&size=10");

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/admin/admin-pdf/:id", () => {
    test("should fetch a pdf by id", async () => {
      const res = await request(app)
        .get(`/api/admin/admin-pdf/${pdfId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("_id", pdfId);
      expect(res.body.data).toHaveProperty("pdfUrl");
    });

    test("should return 404 for non-existing pdf id", async () => {
      const res = await request(app)
        .get("/api/admin/admin-pdf/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/admin/admin-pdf/:id", () => {
    test("should update pdf isActive status", async () => {
      const res = await request(app)
        .put(`/api/admin/admin-pdf/${pdfId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("isActive", false);
    });

    test("should return 404 for non-existing pdf id", async () => {
      const res = await request(app)
        .put("/api/admin/admin-pdf/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/admin/admin-pdf/:id", () => {
    test("should delete a pdf successfully", async () => {
      const extraPdf = await AdminPDFModel.create({
        book: bookId,
        pdfUrl: "/uploads/pdfs/delete-me.pdf",
        isActive: false,
      });

      const res = await request(app)
        .delete(`/api/admin/admin-pdf/${extraPdf._id.toString()}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existing pdf id", async () => {
      const res = await request(app)
        .delete("/api/admin/admin-pdf/64f0f0f0f0f0f0f0f0f0f0f0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/admin/admin-pdf", () => {
    test("should return 400 if no pdf file is uploaded", async () => {
      const res = await request(app)
        .post("/api/admin/admin-pdf")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ book: bookId });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 400 if book id is missing", async () => {
      const res = await request(app)
        .post("/api/admin/admin-pdf")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});