import request from "supertest";
import app from "../../app";
import bcryptjs from "bcryptjs";

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
  });
});