import request from "supertest";
import app from "../../app";
import { BookModel } from "../../models/book.model";
import { UserModel } from "../../models/user.model";
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
        genre: "Fiction",
        pages: 100,
        price: 19.99,
        publishedDate: "2023-01-01",
        coverImageUrl: "/uploads/sample.jpg",
        description: "Sample description",
    };

    let adminToken = "";
    let bookId = "";

    beforeAll(async () => {
        // cleanup old stuff (avoid duplicate unique constraints)
        await UserModel.deleteMany({
        $or: [
            { email: adminUser.email },
            { username: adminUser.username },
            { phone: adminUser.phone },
        ],
        });

        await BookModel.deleteMany({ title: sampleBook.title });

        // ✅ create admin with hashed password (login uses bcrypt.compare)
        const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
        await UserModel.create({ ...adminUser, password: hashedPassword });

        // ✅ login admin to get JWT
        const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });

        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
        await BookModel.deleteMany({
        $or: [{ title: sampleBook.title }, { title: "Updated Book" }],
        });

        await UserModel.deleteMany({
        $or: [
            { email: adminUser.email },
            { username: adminUser.username },
            { phone: adminUser.phone },
        ],
        });
    });

    test("POST /api/admin/books - creates a new book", async () => {
        const res = await request(app)
        .post("/api/admin/books")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sampleBook);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("title", sampleBook.title);

        bookId = res.body.data._id;
    });

    test("GET /api/admin/books/:id - fetch a single book by id", async () => {
        const res = await request(app)
        .get(`/api/admin/books/${bookId}`)
        .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("title", sampleBook.title);
    });

    test("PUT /api/admin/books/:id - update a book", async () => {
        const res = await request(app)
        .put(`/api/admin/books/${bookId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Updated Book" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("title", "Updated Book");
    });

    test("GET /api/admin/books - fetch all books with pagination", async () => {
        const res = await request(app)
        .get("/api/admin/books?page=1&size=10")
        .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("DELETE /api/admin/books/:id - delete a book", async () => {
        const res = await request(app)
        .delete(`/api/admin/books/${bookId}`)
        .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
    });
});
