import { CategoryService } from "../../../services/category.service";
import { CategoryRepository } from "../../../repositories/category.repository";

describe("CategoryService Unit Tests", () => {
  let categoryService: CategoryService;

  const getCategoryByIdSpy = jest.spyOn(CategoryRepository.prototype, "getCategoryById");
  const getAllCategoriesSpy = jest.spyOn(CategoryRepository.prototype, "getAllCategories");

  beforeEach(() => {
    jest.clearAllMocks();
    categoryService = new CategoryService();
  });

  test("getCategoryById - should return category if found and active", async () => {
    const mockCategory = { _id: "c1", name: "fiction", isActive: true };
    getCategoryByIdSpy.mockResolvedValue(mockCategory as any);

    const result = await categoryService.getCategoryById("c1");

    expect(result).toEqual(mockCategory);
    expect(getCategoryByIdSpy).toHaveBeenCalledWith("c1");
  });

  test("getCategoryById - should throw 404 if category not found", async () => {
    getCategoryByIdSpy.mockResolvedValue(null);

    await expect(categoryService.getCategoryById("nonexistent")).rejects.toThrow("Category not found");
  });

  test("getCategoryById - should throw 404 if category is inactive", async () => {
    const inactiveCategory = { _id: "c1", name: "fiction", isActive: false };
    getCategoryByIdSpy.mockResolvedValue(inactiveCategory as any);

    await expect(categoryService.getCategoryById("c1")).rejects.toThrow("Category not found");
  });

  test("getAllCategories - should return only active categories", async () => {
    const mockCategories = [
      { _id: "c1", name: "fiction", isActive: true },
      { _id: "c2", name: "horror", isActive: false },
      { _id: "c3", name: "science", isActive: true },
    ];
    getAllCategoriesSpy.mockResolvedValue(mockCategories as any);

    const result = await categoryService.getAllCategories();

    expect(result).toHaveLength(2);
    expect(result.every((c) => c.isActive)).toBe(true);
  });

  test("getAllCategories - should return empty array if no active categories", async () => {
    const mockCategories = [
      { _id: "c1", name: "fiction", isActive: false },
      { _id: "c2", name: "horror", isActive: false },
    ];
    getAllCategoriesSpy.mockResolvedValue(mockCategories as any);

    const result = await categoryService.getAllCategories();

    expect(result).toHaveLength(0);
  });
});