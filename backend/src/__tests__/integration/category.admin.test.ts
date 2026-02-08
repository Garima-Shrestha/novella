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

    test("PUT /api/admin/categories/:id - admin updates a category", async () => {
        const res = await request(app)
            .put(`/api/admin/categories/${categoryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "UpdatedAdminCategory" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("name", "updatedadmincategory");
    });
});
