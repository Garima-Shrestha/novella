import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth Integration Tests", () => {
    const testUser = {
        username: "testuser",
        email: "test@example.com",
        countryCode: "+977",
        phone: "9812345678",
        password: "Password123!",
    };

    const newPassword = "NewPass123!";

    beforeAll(async () => {
        await UserModel.deleteMany({
        $or: [
            { email: testUser.email },
            { username: testUser.username },
            { phone: testUser.phone },
        ],
        });
    });

    afterAll(async () => {
        await UserModel.deleteMany({
        $or: [
            { email: testUser.email },
            { username: testUser.username },
            { phone: testUser.phone },
        ],
        });
    });

    describe("POST /api/auth/register", () => {
        test("should register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
        });

        test("should not register a new user with duplicate email", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty("success", false);
        });

        test("should not register a new user with duplicate username", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
            ...testUser,
            email: "new@email.com",
            phone: "9812345679", // change phone so phone unique doesn't block username test
            });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("POST /api/auth/login", () => {
        test("should login an existing user", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("token");
        });

        test("should not login with incorrect password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: "WrongPassword!" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("PUT /api/auth/change-password", () => {
        let token = "";

        beforeAll(async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        token = loginResponse.body.token;
        });

        test("should change password successfully", async () => {
        const response = await request(app)
            .put("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({ oldPassword: testUser.password, password: newPassword });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        });

        test("should not change password with wrong old password", async () => {
        const response = await request(app)
            .put("/api/auth/change-password")
            .set("Authorization", `Bearer ${token}`)
            .send({ oldPassword: "WrongOld123!", password: "AnotherPass123!" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        });

        test("should login with new password after change", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: newPassword });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("token");
        });
    });
});
