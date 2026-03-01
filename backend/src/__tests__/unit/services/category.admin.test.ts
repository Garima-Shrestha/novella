import { AdminCategoryService } from "../../../services/admin/category.service";
import { CategoryRepository } from "../../../repositories/category.repository";

describe("AdminCategoryService Unit Tests", () => {
  let adminCategoryService: AdminCategoryService;

  const getCategoryByNameSpy = jest.spyOn(CategoryRepository.prototype, "getCategoryByName");
  const getCategoryByIdSpy = jest.spyOn(CategoryRepository.prototype, "getCategoryById");
  const createCategorySpy = jest.spyOn(CategoryRepository.prototype, "createCategory");
  const updateOneCategorySpy = jest.spyOn(CategoryRepository.prototype, "updateOneCategory");
  const deleteOneCategorySpy = jest.spyOn(CategoryRepository.prototype, "deleteOneCategory");
  const getAllCategoriesSpy = jest.spyOn(CategoryRepository.prototype, "getAllCategories");

  beforeEach(() => {
    jest.clearAllMocks();
    adminCategoryService = new AdminCategoryService();
  });

  test("createCategory - should create category successfully", async () => {
    getCategoryByNameSpy.mockResolvedValue(null);
    const mockCategory = { _id: "c1", name: "fiction" };
    createCategorySpy.mockResolvedValue(mockCategory as any);

    const result = await adminCategoryService.createCategory({ name: "Fiction" });

    expect(result).toEqual(mockCategory);
    expect(createCategorySpy).toHaveBeenCalledTimes(1);
  });

  test("createCategory - should throw 409 if category name already exists", async () => {
    getCategoryByNameSpy.mockResolvedValue({ _id: "c1", name: "fiction" } as any);

    await expect(adminCategoryService.createCategory({ name: "Fiction" })).rejects.toThrow(
      "Category name already exists"
    );

    expect(createCategorySpy).not.toHaveBeenCalled();
  });

  test("updateCategory - should update category successfully", async () => {
    const mockCategory = { _id: "c1", name: "fiction" };
    const updatedCategory = { _id: "c1", name: "updated fiction" };
    getCategoryByIdSpy.mockResolvedValue(mockCategory as any);
    getCategoryByNameSpy.mockResolvedValue(null);
    updateOneCategorySpy.mockResolvedValue(updatedCategory as any);

    const result = await adminCategoryService.updateCategory("c1", { name: "Updated Fiction" });

    expect(result).toEqual(updatedCategory);
    expect(updateOneCategorySpy).toHaveBeenCalledTimes(1);
  });

  test("updateCategory - should throw 404 if category not found", async () => {
    getCategoryByIdSpy.mockResolvedValue(null);

    await expect(adminCategoryService.updateCategory("nonexistent", { name: "New Name" })).rejects.toThrow(
      "Category not found"
    );

    expect(updateOneCategorySpy).not.toHaveBeenCalled();
  });

  test("updateCategory - should throw 409 if new name already taken by another category", async () => {
    getCategoryByIdSpy.mockResolvedValue({ _id: "c1", name: "fiction" } as any);
    getCategoryByNameSpy.mockResolvedValue({ _id: "c2", name: "horror" } as any);

    await expect(adminCategoryService.updateCategory("c1", { name: "horror" })).rejects.toThrow(
      "Category name already exists"
    );

    expect(updateOneCategorySpy).not.toHaveBeenCalled();
  });

  test("deleteCategory - should delete category successfully", async () => {
    getCategoryByIdSpy.mockResolvedValue({ _id: "c1", name: "fiction" } as any);
    deleteOneCategorySpy.mockResolvedValue(true);

    const result = await adminCategoryService.deleteCategory("c1");

    expect(result).toBe(true);
    expect(deleteOneCategorySpy).toHaveBeenCalledWith("c1");
  });

  test("deleteCategory - should throw 404 if category not found", async () => {
    getCategoryByIdSpy.mockResolvedValue(null);

    await expect(adminCategoryService.deleteCategory("nonexistent")).rejects.toThrow("Category not found");

    expect(deleteOneCategorySpy).not.toHaveBeenCalled();
  });

  test("getAllCategories - should return all categories", async () => {
    const mockCategories = [
      { _id: "c1", name: "fiction" },
      { _id: "c2", name: "horror" },
    ];
    getAllCategoriesSpy.mockResolvedValue(mockCategories as any);

    const result = await adminCategoryService.getAllCategories();

    expect(result).toHaveLength(2);
    expect(getAllCategoriesSpy).toHaveBeenCalledTimes(1);
  });

  test("getCategoryById - should return category if found", async () => {
    const mockCategory = { _id: "c1", name: "fiction" };
    getCategoryByIdSpy.mockResolvedValue(mockCategory as any);

    const result = await adminCategoryService.getCategoryById("c1");

    expect(result).toEqual(mockCategory);
    expect(getCategoryByIdSpy).toHaveBeenCalledWith("c1");
  });

  test("1getCategoryById - should throw 404 if category not found", async () => {
    getCategoryByIdSpy.mockResolvedValue(null);

    await expect(adminCategoryService.getCategoryById("nonexistent")).rejects.toThrow("Category not found");
  });
});