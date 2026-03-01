import { AdminBookAccessService } from "../../../services/admin/book-access.service";
import { BookAccessRepository } from "../../../repositories/book-access.repository";
import { AdminPDFRepository } from "../../../repositories/admin-pdf.repository";

jest.mock("../../../repositories/book-access.repository");
jest.mock("../../../repositories/admin-pdf.repository");

describe("AdminBookAccessService Unit Tests", () => {
  let adminBookAccessService: AdminBookAccessService;

  const getActiveAccessByUserAndBookSpy = jest.spyOn(BookAccessRepository.prototype, "getActiveAccessByUserAndBook");
  const getPreviousAccessByUserAndBookSpy = jest.spyOn(BookAccessRepository.prototype, "getPreviousAccessByUserAndBook");
  const adminCreateRentalSpy = jest.spyOn(BookAccessRepository.prototype, "adminCreateRental");
  const getActivePdfByBookSpy = jest.spyOn(AdminPDFRepository.prototype, "getActivePdfByBook");
  const getBookAccessByIdSpy = jest.spyOn(BookAccessRepository.prototype, "getBookAccessById");
  const updateOneBookAccessSpy = jest.spyOn(BookAccessRepository.prototype, "updateOneBookAccess");
  const deleteOneBookAccessSpy = jest.spyOn(BookAccessRepository.prototype, "deleteOneBookAccess");
  const getAllBookAccessPaginatedSpy = jest.spyOn(BookAccessRepository.prototype, "getAllBookAccessPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    adminBookAccessService = new AdminBookAccessService();
  });

  test("createBookAccess - should create book access successfully", async () => {
    const mockAccess = { _id: "a1", isActive: true, pdfUrl: "/uploads/pdfs/test.pdf" };
    getActiveAccessByUserAndBookSpy.mockResolvedValue(null);
    getActivePdfByBookSpy.mockResolvedValue({ pdfUrl: "/uploads/pdfs/test.pdf" } as any);
    getPreviousAccessByUserAndBookSpy.mockResolvedValue(null);
    adminCreateRentalSpy.mockResolvedValue(mockAccess as any);

    const result = await adminBookAccessService.createBookAccess({
      user: "u1",
      book: "b1",
      expiresAt: new Date(Date.now() + 86400000),
    });

    expect(result).toEqual(mockAccess);
    expect(adminCreateRentalSpy).toHaveBeenCalledTimes(1);
  });

  test("createBookAccess - should throw 409 if active non-expired access exists", async () => {
    getActiveAccessByUserAndBookSpy.mockResolvedValue({
      _id: "a1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      isActive: true,
    } as any);

    await expect(
      adminBookAccessService.createBookAccess({
        user: "u1",
        book: "b1",
        expiresAt: new Date(Date.now() + 86400000),
      })
    ).rejects.toThrow("This user already has access to this book");

    expect(adminCreateRentalSpy).not.toHaveBeenCalled();
  });

  test("createBookAccess - should throw 404 if no active PDF", async () => {
    getActiveAccessByUserAndBookSpy.mockResolvedValue(null);
    getActivePdfByBookSpy.mockResolvedValue(null);

    await expect(
      adminBookAccessService.createBookAccess({
        user: "u1",
        book: "b1",
        expiresAt: new Date(Date.now() + 86400000),
      })
    ).rejects.toThrow("PDF not uploaded for this book yet");

    expect(adminCreateRentalSpy).not.toHaveBeenCalled();
  });

  test("getBookAccessById - should return access if found", async () => {
    const mockAccess = { _id: "a1", isActive: true };
    getBookAccessByIdSpy.mockResolvedValue(mockAccess as any);

    const result = await adminBookAccessService.getBookAccessById("a1");

    expect(result).toEqual(mockAccess);
    expect(getBookAccessByIdSpy).toHaveBeenCalledWith("a1");
  });

  test("getBookAccessById - should throw 404 if access not found", async () => {
    getBookAccessByIdSpy.mockResolvedValue(null);

    await expect(adminBookAccessService.getBookAccessById("nonexistent")).rejects.toThrow(
      "Book access not found"
    );
  });

  test("updateBookAccess - should update access successfully", async () => {
    const mockAccess = { _id: "a1", user: "u1", book: "b1", isActive: false };
    const updatedAccess = { _id: "a1", isActive: true };
    getBookAccessByIdSpy.mockResolvedValue(mockAccess as any);
    getActiveAccessByUserAndBookSpy.mockResolvedValue(null);
    updateOneBookAccessSpy.mockResolvedValue(updatedAccess as any);

    const result = await adminBookAccessService.updateBookAccess("a1", { isActive: true });

    expect(result).toEqual(updatedAccess);
    expect(updateOneBookAccessSpy).toHaveBeenCalledTimes(1);
  });

  test("deleteBookAccess - should delete access successfully", async () => {
    deleteOneBookAccessSpy.mockResolvedValue(true);

    const result = await adminBookAccessService.deleteBookAccess("a1");

    expect(result).toBe(true);
    expect(deleteOneBookAccessSpy).toHaveBeenCalledWith("a1");
  });

  test("getAllBookAccesses - should return paginated accesses", async () => {
    const mockAccesses = [{ _id: "a1" }, { _id: "a2" }];
    getAllBookAccessPaginatedSpy.mockResolvedValue({ bookAccesses: mockAccesses as any, total: 2 });

    const result = await adminBookAccessService.getAllBookAccesses("1", "10");

    expect(result).toHaveProperty("bookAccesses");
    expect(result).toHaveProperty("pagination");
    expect(result.pagination).toEqual({ page: 1, size: 10, total: 2, totalPages: 1 });
  });
});