import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("Admin User Integration Tests", () => {
    const adminUser = {
        username: "adminuser",
        email: "admin@example.com",
        password: "AdminPass123!",
        role: "admin",
        phone: "1234567890",
        countryCode: "+1",
    };

    const normalUser = {
        username: "normaluser",
        email: "user@example.com",
        password: "UserPass123!",
        phone: "0987654321",
        countryCode: "+1",
    };

    let adminToken = "";
    let adminId = "";
    let normalUserId = ""; 

    beforeAll(async () => {
        // cleanup old data
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

        // create admin with hashed password
        const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
        const admin = await UserModel.create({ ...adminUser, password: hashedPassword });
        adminId = admin._id.toString();

        // login to get token
        const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });

        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
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
    });

    describe("POST /api/admin/users", () => {
        test("creates a new user", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(normalUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("success", true);

        normalUserId = res.body.data?._id?.toString();
        });
    });

    describe("GET /api/admin/users/:id", () => {
        test("fetches a user by id", async () => {
        const res = await request(app)
            .get(`/api/admin/users/${adminId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("email", adminUser.email);
        });
    });

    describe("PUT /api/admin/users/:id", () => {
        test("updates a user successfully", async () => {
        const res = await request(app)
            .put(`/api/admin/users/${adminId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ username: "updatedadmin" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("username", "updatedadmin");
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        test("deletes a user successfully", async () => {
        const res = await request(app)
            .delete(`/api/admin/users/${normalUserId}`) // delete normal user, not admin
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/admin/users", () => {
        test("fetches all users with pagination", async () => {
        const res = await request(app)
            .get(`/api/admin/users?page=1&size=10`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("pagination");
        });
    });
});
