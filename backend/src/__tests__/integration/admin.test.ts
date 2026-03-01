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

        test("should not create user with duplicate email", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            ...normalUser,
            username: "anotheruser",
            phone: "1112223334",    
            });

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("success", false);
        });

        test("should not create user with duplicate username", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            ...normalUser,
            email: "unique@email.com",
            phone: "1112223335",      
            });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("success", false);
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

        test("should not update user with duplicate email", async () => {
        const uniq = Date.now();

        const otherUser = {
            username: `otheruser_${uniq}`,
            email: `other_${uniq}@email.com`,
            password: "OtherPass123!",
            phone: `222333${uniq.toString().slice(-4)}`, // keep phone unique + numeric
            countryCode: "+1",
            role: "user",
        };

        const hashed = await bcryptjs.hash(otherUser.password, 10);
        await UserModel.create({ ...otherUser, password: hashed });

        const res = await request(app)
            .put(`/api/admin/users/${adminId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ email: otherUser.email });

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("success", false);
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

    describe("GET /api/admin/users/:id (Not Found)", () => {
        test("should return 404 for non-existing user id", async () => {
        const res = await request(app)
            .get("/api/admin/users/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("DELETE /api/admin/users/:id (Not Found)", () => {
        test("should return 404 for non-existing user id", async () => {
        const res = await request(app)
            .delete("/api/admin/users/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/admin/users (Search)", () => {
        test("should search users by username", async () => {
        const res = await request(app)
            .get("/api/admin/users?page=1&size=10&searchTerm=updatedadmin")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("PUT /api/admin/users/:id (Not Found)", () => {
        test("should return 404 for non-existing user id", async () => {
        const res = await request(app)
            .put("/api/admin/users/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ username: "ghostuser" });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("POST /api/admin/users (Validation)", () => {
        test("should return 400 for missing required fields", async () => {
        const res = await request(app)
            .post("/api/admin/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ username: "ab" });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/admin/users (Unauthorized)", () => {
        test("should not allow access without token", async () => {
        const res = await request(app).get("/api/admin/users?page=1&size=10");

        expect([401, 403]).toContain(res.status);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/admin/users (Non-admin)", () => {
        test("should not allow access with normal user token", async () => {
        const hashed = await bcryptjs.hash(normalUser.password, 10);
        await UserModel.create({ ...normalUser, password: hashed });

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: normalUser.email, password: normalUser.password });

        const userToken = loginRes.body.token;

        const res = await request(app)
            .get("/api/admin/users?page=1&size=10")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/admin/users (Search)", () => {
        test("should search users by email", async () => {
        const res = await request(app)
            .get(`/api/admin/users?page=1&size=10&searchTerm=${adminUser.email}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("pagination");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        });

        test("should return empty array for unmatched search", async () => {
        const res = await request(app)
            .get("/api/admin/users?page=1&size=10&searchTerm=zzznomatchzzz")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveLength(0);
        });
    });
});
