import request from "supertest";
import app from "../../app";
import { BookModel } from "../../models/book.model";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import bcryptjs from "bcryptjs";

describe("Admin Book Integration Tests", () => {
    const adminUser = {
        username: "adminbookuser",
        email: "admin@example.com",
        password: "AdminPass123!",
        role: "admin",
        phone: "1112223333",
        countryCode: "+1",
    };

    const sampleBook = {
        title: "Sample Book",
        author: "Author One",
        genre: "",
        pages: 100,
        price: 19.99,
        publishedDate: "2023-01-01",
        coverImageUrl: "/uploads/sample.jpg",
        description: "Sample description",
    };

    let adminToken = "";
    let bookId = "";
    let categoryId = "";

    beforeAll(async () => {
        await UserModel.deleteMany({ $or: [{ email: adminUser.email }, { username: adminUser.username }, { phone: adminUser.phone }] });
        await BookModel.deleteMany({});
        await CategoryModel.deleteMany({});

        const category = await CategoryModel.create({ name: "Fiction" });
        categoryId = category._id.toString();
        sampleBook.genre = categoryId;

        const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
        await UserModel.create({ ...adminUser, password: hashedPassword });

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: adminUser.email, password: adminUser.password });

        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
        await BookModel.deleteMany({});
        await UserModel.deleteMany({ $or: [{ email: adminUser.email }, { username: adminUser.username }, { phone: adminUser.phone }] });
        await CategoryModel.deleteMany({});
    });

    describe("POST /api/admin/books", () => {
        test("creates a new book", async () => {
            const res = await request(app)
                .post("/api/admin/books")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(sampleBook);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveProperty("title", sampleBook.title);

            bookId = res.body.data._id;
        });
    });

    describe("GET /api/admin/books/:id", () => {
        test("fetch a single book by id", async () => {
            const res = await request(app)
                .get(`/api/admin/books/${bookId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveProperty("title", sampleBook.title);
        });
    });

    describe("PUT /api/admin/books/:id", () => {
        test("update a book", async () => {
            const res = await request(app)
                .put(`/api/admin/books/${bookId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ title: "Updated Book" });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveProperty("title", "Updated Book");
        });
    });

    describe("GET /api/admin/books", () => {
        test("fetch all books with pagination", async () => {
            const res = await request(app)
                .get("/api/admin/books?page=1&size=10")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("pagination");
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("DELETE /api/admin/books/:id", () => {
        test("delete a book", async () => {
            const res = await request(app)
                .delete(`/api/admin/books/${bookId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/admin/books/:id (Not Found)", () => {
        test("should return 404 for non-existing book id", async () => {
            const res = await request(app)
                .get("/api/admin/books/64f0f0f0f0f0f0f0f0f0f0f0")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("PUT /api/admin/books/:id (Not Found)", () => {
        test("should return 404 for non-existing book id", async () => {
            const res = await request(app)
                .put("/api/admin/books/64f0f0f0f0f0f0f0f0f0f0f0")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ title: "Ghost Book" });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("DELETE /api/admin/books/:id (Not Found)", () => {
        test("should return 404 for non-existing book id", async () => {
            const res = await request(app)
                .delete("/api/admin/books/64f0f0f0f0f0f0f0f0f0f0f0")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/admin/books (Search)", () => {
        test("should search books by title", async () => {
            const res = await request(app)
                .get("/api/admin/books?page=1&size=10&searchTerm=Sample")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("GET /api/admin/books (Search by author)", () => {
        test("should search books by author", async () => {
            const res = await request(app)
                .get("/api/admin/books?page=1&size=10&searchTerm=Author One")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test("should return empty for unmatched search", async () => {
            const res = await request(app)
                .get("/api/admin/books?page=1&size=10&searchTerm=zzznomatchzzz")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body.data).toHaveLength(0);
        });
    });
});
