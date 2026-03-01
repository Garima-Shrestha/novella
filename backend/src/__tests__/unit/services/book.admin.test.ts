import { AdminBookService } from "../../../services/admin/book.service";
import { BookRepository } from "../../../repositories/book.repository";

describe("AdminBookService Unit Tests", () => {
  let adminBookService: AdminBookService;

  const getBookByIdSpy = jest.spyOn(BookRepository.prototype, "getBookById");
  const createBookSpy = jest.spyOn(BookRepository.prototype, "createBook");
  const updateOneBookSpy = jest.spyOn(BookRepository.prototype, "updateOneBook");
  const deleteOneBookSpy = jest.spyOn(BookRepository.prototype, "deleteOneBook");
  const getAllBooksPaginatedSpy = jest.spyOn(BookRepository.prototype, "getAllBooksPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    adminBookService = new AdminBookService();
  });

  test("createBook - should create a new book successfully", async () => {
    const mockBook = { _id: "b1", title: "New Book", author: "Author One" };
    createBookSpy.mockResolvedValue(mockBook as any);

    const result = await adminBookService.createBook({
      title: "New Book",
      author: "Author One",
      genre: "categoryId123",
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "A new book",
    });

    expect(result).toEqual(mockBook);
    expect(createBookSpy).toHaveBeenCalledTimes(1);
  });

  test("updateBook - should update book successfully", async () => {
    const mockBook = { _id: "b1", title: "Old Title" };
    const updatedBook = { _id: "b1", title: "Updated Title" };
    getBookByIdSpy.mockResolvedValue(mockBook as any);
    updateOneBookSpy.mockResolvedValue(updatedBook as any);

    const result = await adminBookService.updateBook("b1", { title: "Updated Title" });

    expect(result).toEqual(updatedBook);
    expect(updateOneBookSpy).toHaveBeenCalledWith("b1", { title: "Updated Title" });
  });

  test("updateBook - should throw 404 if book not found", async () => {
    getBookByIdSpy.mockResolvedValue(null);

    await expect(adminBookService.updateBook("nonexistent", { title: "Title" })).rejects.toThrow("Book not found");

    expect(updateOneBookSpy).not.toHaveBeenCalled();
  });

  test("deleteBook - should delete book successfully", async () => {
    const mockBook = { _id: "b1", title: "Book To Delete" };
    getBookByIdSpy.mockResolvedValue(mockBook as any);
    deleteOneBookSpy.mockResolvedValue(true);

    const result = await adminBookService.deleteBook("b1");

    expect(result).toBe(true);
    expect(deleteOneBookSpy).toHaveBeenCalledWith("b1");
  });

  test("deleteBook - should throw 404 if book not found", async () => {
    getBookByIdSpy.mockResolvedValue(null);

    await expect(adminBookService.deleteBook("nonexistent")).rejects.toThrow("Book not found");

    expect(deleteOneBookSpy).not.toHaveBeenCalled();
  });
});