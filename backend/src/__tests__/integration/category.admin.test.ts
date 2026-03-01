import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { CategoryModel } from "../../models/category.model";
import bcryptjs from "bcryptjs";

describe("Admin Category Integration Tests", () => {
    const adminUser = {
        username: "admin123",
        email: "admin@example.com",
        password: "AdminPass123!",
        role: "admin",
        phone: "1112223333",
        countryCode: "+977",
    };

    let adminToken = "";
    let categoryId = "";

    beforeAll(async () => {
        await UserModel.deleteMany({ email: adminUser.email });
        await CategoryModel.deleteMany();

        const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
        await UserModel.create({ ...adminUser, password: hashedPassword });

        const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: adminUser.email, password: adminUser.password });

        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: adminUser.email });
        await CategoryModel.deleteMany();
    });

    test("POST /api/admin/categories - admin creates a new category", async () => {
        const res = await request(app)
            .post("/api/admin/categories")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "AdminCategory" });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        // account for lowercase transform
        expect(res.body.data).toHaveProperty("name", "admincategory");

        categoryId = res.body.data._id;
    });

    test("POST /api/admin/categories - should not create duplicate category", async () => {
        const res = await request(app)
            .post("/api/admin/categories")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "AdminCategory" }); // already exists (case-insensitive)

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    test("PUT /api/admin/categories/:id - admin updates a category", async () => {
        const res = await request(app)
            .put(`/api/admin/categories/${categoryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "UpdatedAdminCategory" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "updatedadmincategory");
    });

    test("DELETE /api/admin/categories/:id - admin deletes category", async () => {
        const res = await request(app)
            .delete(`/api/admin/categories/${categoryId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("PUT /api/admin/categories/:id - should return 404 for non-existing category", async () => {
        const res = await request(app)
            .put("/api/admin/categories/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "AnotherCategory" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test("GET /api/admin/categories - admin fetches all categories", async () => {
        await CategoryModel.create({ name: "FetchAllCategory" });

        const res = await request(app)
            .get("/api/admin/categories")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("GET /api/admin/categories/:id - admin fetches category by id", async () => {
        const cat = await CategoryModel.create({ name: "FetchByIdCategory" });

        const res = await request(app)
            .get(`/api/admin/categories/${cat._id.toString()}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "FetchByIdCategory");
    });

    test("GET /api/admin/categories/:id - should return 404 for non-existing category", async () => {
        const res = await request(app)
            .get("/api/admin/categories/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test("DELETE /api/admin/categories/:id - should return 404 for non-existing category", async () => {
        const res = await request(app)
            .delete("/api/admin/categories/64f0f0f0f0f0f0f0f0f0f0f0")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    test("POST /api/admin/categories - should return 400 for missing name", async () => {
        const res = await request(app)
            .post("/api/admin/categories")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("PUT /api/admin/categories/:id - should return 409 for duplicate name on update", async () => {
        const catA = await CategoryModel.create({ name: "ConflictCatA" });
        const catB = await CategoryModel.create({ name: "ConflictCatB" });

        const res = await request(app)
            .put(`/api/admin/categories/${catB._id.toString()}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "ConflictCatA" });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    test("GET /api/admin/categories - should not allow access without token", async () => {
        const res = await request(app).get("/api/admin/categories");

        expect([401, 403]).toContain(res.status);
        expect(res.body.success).toBe(false);
    });
});
