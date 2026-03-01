import { BookService } from "../../../services/book.service";
import { BookRepository } from "../../../repositories/book.repository";

describe("BookService Unit Tests", () => {
  let bookService: BookService;

  const getBookByIdSpy = jest.spyOn(BookRepository.prototype, "getBookById");
  const getAllBooksPaginatedSpy = jest.spyOn(BookRepository.prototype, "getAllBooksPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    bookService = new BookService();
  });

  test("getBookById - should return book if found", async () => {
    const mockBook = { _id: "b1", title: "Test Book", author: "Author One" };
    getBookByIdSpy.mockResolvedValue(mockBook as any);

    const result = await bookService.getBookById("b1");

    expect(result).toEqual(mockBook);
    expect(getBookByIdSpy).toHaveBeenCalledWith("b1");
  });

  test("getBookById - should throw 404 if book not found", async () => {
    getBookByIdSpy.mockResolvedValue(null);

    await expect(bookService.getBookById("nonexistent")).rejects.toThrow("Book not found");
  });

  test("getAllBooksPaginated - should return books with pagination meta", async () => {
    const mockBooks = [
      { _id: "b1", title: "Book One" },
      { _id: "b2", title: "Book Two" },
    ];
    getAllBooksPaginatedSpy.mockResolvedValue({ books: mockBooks as any, total: 2 });

    const result = await bookService.getAllBooksPaginated("1", "10");

    expect(result).toHaveProperty("books");
    expect(result).toHaveProperty("pagination");
    expect(result.books).toHaveLength(2);
    expect(result.pagination).toEqual({ page: 1, size: 10, total: 2, totalPages: 1 });
  });

  test("getAllBooksPaginated - should use default page and size when not provided", async () => {
    getAllBooksPaginatedSpy.mockResolvedValue({ books: [], total: 0 });

    const result = await bookService.getAllBooksPaginated();

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.size).toBe(10);
    expect(getAllBooksPaginatedSpy).toHaveBeenCalledWith(1, 10, undefined);
  });

  test("getAllBooksPaginated - should pass searchTerm to repository", async () => {
    const mockBooks = [{ _id: "b1", title: "Clean Code" }];
    getAllBooksPaginatedSpy.mockResolvedValue({ books: mockBooks as any, total: 1 });

    const result = await bookService.getAllBooksPaginated("1", "10", "Clean Code");

    expect(getAllBooksPaginatedSpy).toHaveBeenCalledWith(1, 10, "Clean Code");
    expect(result.books).toHaveLength(1);
  });

  test("getAllBooksPaginated - should return empty books array when no books exist", async () => {
    getAllBooksPaginatedSpy.mockResolvedValue({ books: [], total: 0 });

    const result = await bookService.getAllBooksPaginated("1", "10");

    expect(result.books).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  test("getAllBooksPaginated - should calculate totalPages correctly", async () => {
    getAllBooksPaginatedSpy.mockResolvedValue({ books: [] as any, total: 25 });

    const result = await bookService.getAllBooksPaginated("1", "10");

    expect(result.pagination.totalPages).toBe(3);
  });

  test("getAllBooksPaginated - should parse page and size as integers", async () => {
    getAllBooksPaginatedSpy.mockResolvedValue({ books: [], total: 0 });

    await bookService.getAllBooksPaginated("2", "5");

    expect(getAllBooksPaginatedSpy).toHaveBeenCalledWith(2, 5, undefined);
  });

  test("getBookById - should call repository exactly once", async () => {
    const mockBook = { _id: "b1", title: "Test Book" };
    getBookByIdSpy.mockResolvedValue(mockBook as any);

    await bookService.getBookById("b1");

    expect(getBookByIdSpy).toHaveBeenCalledTimes(1);
  });

  test("1getAllBooksPaginated - should return correct pagination on page 2", async () => {
    const mockBooks = [{ _id: "b11", title: "Book Eleven" }];
    getAllBooksPaginatedSpy.mockResolvedValue({ books: mockBooks as any, total: 11 });

    const result = await bookService.getAllBooksPaginated("2", "10");

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.books).toHaveLength(1);
  });
});