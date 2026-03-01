import { CategoryRepository } from "../../../repositories/category.repository";
import { CategoryModel } from "../../../models/category.model";
import mongoose from "mongoose";

describe("Category Repository Unit Tests", () => {
  let categoryRepository: CategoryRepository;

  beforeAll(() => {
    categoryRepository = new CategoryRepository();
  });

  afterEach(async () => {
    await CategoryModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("should create a new category", async () => {
    const categoryData = { name: "Fiction" };

    const newCategory = await categoryRepository.createCategory(categoryData);

    expect(newCategory).toBeDefined();
    expect(newCategory.name).toBe("Fiction");
    expect(newCategory._id).toBeDefined();
  });

  test("should get category by name case-insensitively", async () => {
    await CategoryModel.create({ name: "Science" });

    const found = await categoryRepository.getCategoryByName("science");

    expect(found).toBeDefined();
    expect(found?.name).toBe("Science");
  });
});