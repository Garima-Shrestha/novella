import request from "supertest";
import app from "../../app";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

import { UserModel } from "../../models/user.model";
import { BookModel } from "../../models/book.model";
import { CategoryModel } from "../../models/category.model";
import { KhaltiPaymentModel } from "../../models/khalti.model";
import { BookAccessModel } from "../../models/book-access.model";
import { AdminPDFModel } from "../../models/admin-pdf.model";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Khalti Integration Tests", () => {
  const uniq = Date.now();

  const testUser = {
    username: `khaltiuser_${uniq}`,
    email: `khalti_${uniq}@example.com`,
    password: "UserPass123!",
    phone: `98${String(uniq).slice(-8)}`,
    countryCode: "+977",
  };

  let userToken = "";
  let userId = "";
  let bookId = "";
  let categoryId = "";
  let testPidx = `pidx_${uniq}`;

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
        { phone: testUser.phone },
      ],
    });
    await KhaltiPaymentModel.deleteMany({});
    await BookAccessModel.deleteMany({});
    await AdminPDFModel.deleteMany({});

    const hashed = await bcryptjs.hash(testUser.password, 10);
    const user = await UserModel.create({ ...testUser, password: hashed });
    userId = user._id.toString();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    userToken = loginRes.body.token;

    const category = await CategoryModel.create({ name: `KhaltiCat_${uniq}` });
    categoryId = category._id.toString();

    const book = await BookModel.create({
      title: `Khalti Book ${uniq}`,
      author: "Khalti Author",
      genre: categoryId,
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "Khalti test book",
    });
    bookId = book._id.toString();

    await AdminPDFModel.create({
      book: bookId,
      pdfUrl: "/uploads/pdfs/khalti-test.pdf",
      isActive: true,
    });
  });

  afterAll(async () => {
    await KhaltiPaymentModel.deleteMany({});
    await BookAccessModel.deleteMany({});
    await AdminPDFModel.deleteMany({});
    await BookModel.deleteMany({ _id: bookId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await UserModel.deleteMany({ _id: userId });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/khalti/initiate", () => {
    test("should initiate payment successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          pidx: testPidx,
          payment_url: `https://test-pay.khalti.com/?pidx=${testPidx}`,
          expires_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        }),
      });

      const res = await request(app)
        .post("/api/khalti/initiate")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          bookId,
          amount: 1000,
          purchase_order_id: `order_${uniq}`,
          purchase_order_name: `Khalti Book ${uniq}`,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("pidx", testPidx);
      expect(res.body.data).toHaveProperty("payment_url");
    });

    test("should not initiate if user already has active access", async () => {
      await BookAccessModel.create({
        user: userId,
        book: bookId,
        rentedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        isActive: true,
        pdfUrl: "/uploads/pdfs/khalti-test.pdf",
      });

      const res = await request(app)
        .post("/api/khalti/initiate")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          bookId,
          amount: 1000,
          purchase_order_id: `order_dup_${uniq}`,
          purchase_order_name: `Khalti Book ${uniq}`,
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("success", false);

      await BookAccessModel.deleteMany({ user: userId, book: bookId });
    });

    test("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/khalti/initiate")
        .send({
          bookId,
          amount: 1000,
          purchase_order_id: `order_${uniq}`,
          purchase_order_name: `Khalti Book ${uniq}`,
        });

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return error if Khalti API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad request from Khalti" }),
      });

      const res = await request(app)
        .post("/api/khalti/initiate")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          bookId,
          amount: 1000,
          purchase_order_id: `order_fail_${uniq}`,
          purchase_order_name: `Khalti Book ${uniq}`,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("POST /api/khalti/verify", () => {
    afterEach(async () => {
      await KhaltiPaymentModel.deleteMany({});
      await BookAccessModel.deleteMany({ user: userId, book: bookId });
    });

    test("should return 404 if pidx not found", async () => {
      const res = await request(app)
        .post("/api/khalti/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ pidx: "nonexistent_pidx" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should verify and create book access on completed payment", async () => {
      const pidx = `pidx_verify_${uniq}`;

      await KhaltiPaymentModel.create({
        user: new mongoose.Types.ObjectId(userId),
        book: new mongoose.Types.ObjectId(bookId),
        pidx,
        amount: 1000,
        purchaseOrderId: `order_verify_${uniq}`,
        purchaseOrderName: `Khalti Book ${uniq}`,
        status: "Initiated",
        isProcessed: false,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "Completed", transaction_id: `txn_verify_${uniq}` }),
      });

      const res = await request(app)
        .post("/api/khalti/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ pidx });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("status", "Completed");
      expect(res.body.data).toHaveProperty("bookAccessId");
    });

    test("should return pending status if payment not completed", async () => {
      const pidx = `pidx_pending_${uniq}`;

      await KhaltiPaymentModel.create({
        user: new mongoose.Types.ObjectId(userId),
        book: new mongoose.Types.ObjectId(bookId),
        pidx,
        amount: 1000,
        purchaseOrderId: `order_pending_${uniq}`,
        purchaseOrderName: `Khalti Book ${uniq}`,
        status: "Initiated",
        isProcessed: false,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "Pending", transaction_id: null }),
      });

      const res = await request(app)
        .post("/api/khalti/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ pidx });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("status", "Pending");
    });
  });

  test("should return 403 if userId does not match payment user", async () => {
      const pidx = `pidx_forbidden_${uniq}`;
      const otherUserId = new mongoose.Types.ObjectId().toString();

      await KhaltiPaymentModel.create({
        user: new mongoose.Types.ObjectId(otherUserId),
        book: new mongoose.Types.ObjectId(bookId),
        pidx,
        amount: 1000,
        purchaseOrderId: `order_forbidden_${uniq}`,
        purchaseOrderName: `Khalti Book ${uniq}`,
        status: "Initiated",
        isProcessed: false,
      });

      const res = await request(app)
        .post("/api/khalti/verify")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ pidx });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/khalti/verify")
        .send({ pidx: "some_pidx" });

      expect([401, 403]).toContain(res.status);
      expect(res.body).toHaveProperty("success", false);
    });
});