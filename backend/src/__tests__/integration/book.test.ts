import request from "supertest";
import app from "../../app";
import { BookModel } from "../../models/book.model";
import { UserModel } from "../../models/user.model";

describe("User Book Integration Tests", () => {
    const testUser = {
        username: "bookuser",
        email: "user@example.com",
        countryCode: "+977",
        phone: "9811111111",
        password: "UserPass123!",
    };

    const sampleBook = {
        title: "User View Book",
        author: "Author Two",
        genre: "Non-Fiction",
        pages: 150,
        price: 29.99,
        publishedDate: "2023-06-01",
        coverImageUrl: "/uploads/book2.jpg",
        description: "User view book description",
    };

    let userToken = "";
    let bookId = "";

    beforeAll(async () => {
        // cleanup
        await UserModel.deleteMany({
        $or: [{ email: testUser.email }, { username: testUser.username }, { phone: testUser.phone }],
        });
        await BookModel.deleteMany({ title: sampleBook.title });

        // ✅ register user (creates hashed password)
        await request(app).post("/api/auth/register").send(testUser);

        // ✅ login user
        const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

        userToken = loginRes.body.token;

        // create book directly for user tests
        const book = await BookModel.create(sampleBook);
        bookId = book._id.toString();
    });

    afterAll(async () => {
        await BookModel.deleteMany({ title: sampleBook.title });
        await UserModel.deleteMany({
        $or: [{ email: testUser.email }, { username: testUser.username }, { phone: testUser.phone }],
        });
    });

    test("GET /api/books/:id - user fetch single book", async () => {
        const res = await request(app)
        .get(`/api/books/${bookId}`)
        .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("title", sampleBook.title);
    });

    test("GET /api/books - user fetch books with pagination", async () => {
        const res = await request(app)
        .get("/api/books?page=1&size=10")
        .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("GET /api/books/:id - 404 if book not found", async () => {
        const res = await request(app)
        .get("/api/books/64f0f0f0f0f0f0f0f0f0f0f0") // random 24-char hex
        .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
    });

    test("GET /api/books - search by title", async () => {
        const res = await request(app)
        .get(`/api/books?searchTerm=${encodeURIComponent("User View Book")}`)
        .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0]).toHaveProperty("title", sampleBook.title);
    });
});
