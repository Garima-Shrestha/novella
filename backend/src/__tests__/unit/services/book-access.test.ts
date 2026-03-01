import { BookAccessService } from "../../../services/book-access.service";
import { BookAccessRepository } from "../../../repositories/book-access.repository";
import { BookRepository } from "../../../repositories/book.repository";
import { AdminPDFRepository } from "../../../repositories/admin-pdf.repository";

jest.mock("../../../repositories/book-access.repository");
jest.mock("../../../repositories/book.repository");
jest.mock("../../../repositories/admin-pdf.repository");

describe("BookAccessService Unit Tests", () => {
  let bookAccessService: BookAccessService;

  const getBookByIdSpy = jest.spyOn(BookRepository.prototype, "getBookById");
  const getActivePdfByBookSpy = jest.spyOn(AdminPDFRepository.prototype, "getActivePdfByBook");
  const getActiveAccessByUserAndBookSpy = jest.spyOn(BookAccessRepository.prototype, "getActiveAccessByUserAndBook");
  const getPreviousAccessByUserAndBookSpy = jest.spyOn(BookAccessRepository.prototype, "getPreviousAccessByUserAndBook");
  const adminCreateRentalSpy = jest.spyOn(BookAccessRepository.prototype, "adminCreateRental");
  const addBookmarkSpy = jest.spyOn(BookAccessRepository.prototype, "addBookmark");
  const removeBookmarkSpy = jest.spyOn(BookAccessRepository.prototype, "removeBookmark");
  const updateLastPositionSpy = jest.spyOn(BookAccessRepository.prototype, "updateLastPosition");
  const getBookAccessesByUserPaginatedSpy = jest.spyOn(BookAccessRepository.prototype, "getBookAccessesByUserPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    bookAccessService = new BookAccessService();
  });

  test("rentBook - should throw 400 if expiresAt is missing", async () => {
    await expect(
      bookAccessService.rentBook("u1", "b1", undefined as any)
    ).rejects.toThrow("expiresAt is required");
  });

  test("rentBook - should throw 404 if book not found", async () => {
    getBookByIdSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.rentBook("u1", "b1", new Date(Date.now() + 86400000))
    ).rejects.toThrow("Book not found");
  });

  test("rentBook - should throw 404 if no active PDF", async () => {
    getBookByIdSpy.mockResolvedValue({ _id: "b1", title: "Book" } as any);
    getActivePdfByBookSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.rentBook("u1", "b1", new Date(Date.now() + 86400000))
    ).rejects.toThrow("PDF not uploaded for this book yet");
  });

  test("rentBook - should throw 400 if book already rented and not expired", async () => {
    getBookByIdSpy.mockResolvedValue({ _id: "b1", title: "Book" } as any);
    getActivePdfByBookSpy.mockResolvedValue({ pdfUrl: "/uploads/pdfs/test.pdf" } as any);
    getActiveAccessByUserAndBookSpy.mockResolvedValue({
      _id: "a1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      isActive: true,
    } as any);
    getPreviousAccessByUserAndBookSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.rentBook("u1", "b1", new Date(Date.now() + 86400000))
    ).rejects.toThrow("Book already rented until");
  });

  test("rentBook - should create new rental successfully", async () => {
    const mockAccess = { _id: "a1", isActive: true, pdfUrl: "/uploads/pdfs/test.pdf" };
    getBookByIdSpy.mockResolvedValue({ _id: "b1", title: "Book" } as any);
    getActivePdfByBookSpy.mockResolvedValue({ pdfUrl: "/uploads/pdfs/test.pdf" } as any);
    getActiveAccessByUserAndBookSpy.mockResolvedValue(null);
    getPreviousAccessByUserAndBookSpy.mockResolvedValue(null);
    adminCreateRentalSpy.mockResolvedValue(mockAccess as any);

    const result = await bookAccessService.rentBook("u1", "b1", new Date(Date.now() + 86400000));

    expect(result).toEqual(mockAccess);
    expect(adminCreateRentalSpy).toHaveBeenCalledTimes(1);
  });

  test("addBookmark - should add bookmark successfully", async () => {
    const mockAccess = { _id: "a1", bookmarks: [{ page: 2, text: "note" }] };
    addBookmarkSpy.mockResolvedValue(mockAccess as any);

    const result = await bookAccessService.addBookmark("u1", "b1", { page: 2, text: "note" });

    expect(result).toEqual(mockAccess);
    expect(addBookmarkSpy).toHaveBeenCalledTimes(1);
  });

  test("addBookmark - should throw 404 if access not found", async () => {
    addBookmarkSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.addBookmark("u1", "b1", { page: 2, text: "note" })
    ).rejects.toThrow("Book not rented");
  });

  test("removeBookmark - should throw 404 if access not found", async () => {
    removeBookmarkSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.removeBookmark("u1", "b1", 0)
    ).rejects.toThrow("Book not rented");
  });

  test("updateLastPosition - should update last position successfully", async () => {
    const mockAccess = { _id: "a1", lastPosition: { page: 5, offsetY: 100, zoom: 1 } };
    updateLastPositionSpy.mockResolvedValue(mockAccess as any);

    const result = await bookAccessService.updateLastPosition("u1", "b1", { page: 5, offsetY: 100, zoom: 1 });

    expect(result).toEqual(mockAccess);
    expect(updateLastPositionSpy).toHaveBeenCalledTimes(1);
  });

  test("getUserBooks - should return paginated user books", async () => {
    const mockAccesses = [{ _id: "a1" }, { _id: "a2" }];
    getBookAccessesByUserPaginatedSpy.mockResolvedValue({ bookAccesses: mockAccesses as any, total: 2 });

    const result = await bookAccessService.getUserBooks("u1", "1", "10");

    expect(result).toHaveProperty("bookAccesses");
    expect(result).toHaveProperty("pagination");
    expect(result.pagination).toEqual({ page: 1, size: 10, total: 2, totalPages: 1 });
  });

  test("getUserBookAccessByBook - should throw 404 if no active access", async () => {
    getActiveAccessByUserAndBookSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.getUserBookAccessByBook("u1", "b1")
    ).rejects.toThrow("Book not rented or inactive");
  });

  test("getUserBookAccessByBook - should throw 403 if rental expired", async () => {
    getActiveAccessByUserAndBookSpy.mockResolvedValue({
      _id: "a1",
      expiresAt: new Date(Date.now() - 1000 * 60 * 60),
      isActive: true,
      pdfUrl: "/uploads/pdfs/test.pdf",
    } as any);

    await expect(
      bookAccessService.getUserBookAccessByBook("u1", "b1")
    ).rejects.toThrow("Rental expired");
  });

  test("updateLastPosition - should throw 404 if access not found", async () => {
    updateLastPositionSpy.mockResolvedValue(null);

    await expect(
      bookAccessService.updateLastPosition("u1", "b1", { page: 1, offsetY: 0, zoom: 1 })
    ).rejects.toThrow("Book not rented");
  });

  test("getUserBooks - should use default pagination when not provided", async () => {
    getBookAccessesByUserPaginatedSpy.mockResolvedValue({ bookAccesses: [], total: 0 });

    const result = await bookAccessService.getUserBooks("u1");

    expect(getBookAccessesByUserPaginatedSpy).toHaveBeenCalledWith("u1", 1, 10);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.size).toBe(10);
  });
});