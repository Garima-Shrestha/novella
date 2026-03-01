import { AdminPDFService } from "../../../services/admin/admin-pdf.service";
import { AdminPDFRepository } from "../../../repositories/admin-pdf.repository";
import { BookRepository } from "../../../repositories/book.repository";

jest.mock("../../../repositories/admin-pdf.repository");
jest.mock("../../../repositories/book.repository");

describe("AdminPDFService Unit Tests", () => {
  let adminPDFService: AdminPDFService;

  const getAdminPDFByBookSpy = jest.spyOn(AdminPDFRepository.prototype, "getAdminPDFByBook");
  const getBookByIdSpy = jest.spyOn(BookRepository.prototype, "getBookById");
  const createAdminPDFSpy = jest.spyOn(AdminPDFRepository.prototype, "createAdminPDF");
  const getAdminPDFByIdSpy = jest.spyOn(AdminPDFRepository.prototype, "getAdminPDFById");
  const updateOneAdminPDFSpy = jest.spyOn(AdminPDFRepository.prototype, "updateOneAdminPDF");
  const deleteOneAdminPDFSpy = jest.spyOn(AdminPDFRepository.prototype, "deleteOneAdminPDF");
  const getAllAdminPDFPaginatedSpy = jest.spyOn(AdminPDFRepository.prototype, "getAllAdminPDFPaginated");

  beforeEach(() => {
    jest.clearAllMocks();
    adminPDFService = new AdminPDFService();
  });

  test("createAdminPDF - should create PDF successfully", async () => {
    const mockPDF = { _id: "p1", pdfUrl: "/uploads/pdfs/test.pdf", isActive: true };
    getAdminPDFByBookSpy.mockResolvedValue(null);
    getBookByIdSpy.mockResolvedValue({ _id: "b1", title: "Book" } as any);
    createAdminPDFSpy.mockResolvedValue(mockPDF as any);

    const result = await adminPDFService.createAdminPDF({
      book: "b1",
      pdfUrl: "/uploads/pdfs/test.pdf",
      isActive: true,
    });

    expect(result).toEqual(mockPDF);
    expect(createAdminPDFSpy).toHaveBeenCalledTimes(1);
  });

  test("createAdminPDF - should throw 400 if PDF already exists for book", async () => {
    getAdminPDFByBookSpy.mockResolvedValue({ _id: "p1", pdfUrl: "/old.pdf" } as any);

    await expect(
      adminPDFService.createAdminPDF({ book: "b1", pdfUrl: "/new.pdf", isActive: true })
    ).rejects.toThrow("This book already has a PDF assigned");

    expect(createAdminPDFSpy).not.toHaveBeenCalled();
  });

  test("createAdminPDF - should throw 404 if book not found", async () => {
    getAdminPDFByBookSpy.mockResolvedValue(null);
    getBookByIdSpy.mockResolvedValue(null);

    await expect(
      adminPDFService.createAdminPDF({ book: "b1", pdfUrl: "/new.pdf", isActive: true })
    ).rejects.toThrow("Book not found");

    expect(createAdminPDFSpy).not.toHaveBeenCalled();
  });

  test("getAdminPDFById - should return PDF if found", async () => {
    const mockPDF = { _id: "p1", pdfUrl: "/uploads/pdfs/test.pdf" };
    getAdminPDFByIdSpy.mockResolvedValue(mockPDF as any);

    const result = await adminPDFService.getAdminPDFById("p1");

    expect(result).toEqual(mockPDF);
    expect(getAdminPDFByIdSpy).toHaveBeenCalledWith("p1");
  });

  test("getAdminPDFById - should throw 404 if PDF not found", async () => {
    getAdminPDFByIdSpy.mockResolvedValue(null);

    await expect(adminPDFService.getAdminPDFById("nonexistent")).rejects.toThrow("Admin PDF not found");
  });

  test("getAllAdminPDFs - should return paginated PDFs", async () => {
    const mockPDFs = [{ _id: "p1" }, { _id: "p2" }];
    getAllAdminPDFPaginatedSpy.mockResolvedValue({ adminPDFs: mockPDFs as any, total: 2 });

    const result = await adminPDFService.getAllAdminPDFs("1", "10");

    expect(result).toHaveProperty("adminPDFs");
    expect(result).toHaveProperty("pagination");
    expect(result.pagination).toEqual({ page: 1, size: 10, total: 2, totalPages: 1 });
  });

  test("updateAdminPDF - should update PDF successfully", async () => {
    const mockPDF = { _id: "p1", pdfUrl: "/old.pdf" };
    const updatedPDF = { _id: "p1", pdfUrl: "/new.pdf" };
    getAdminPDFByIdSpy.mockResolvedValue(mockPDF as any);
    updateOneAdminPDFSpy.mockResolvedValue(updatedPDF as any);

    const result = await adminPDFService.updateAdminPDF("p1", { pdfUrl: "/new.pdf" } as any);

    expect(result).toEqual(updatedPDF);
    expect(updateOneAdminPDFSpy).toHaveBeenCalledWith("p1", { pdfUrl: "/new.pdf" });
  });

  test("updateAdminPDF - should throw 404 if PDF not found", async () => {
    getAdminPDFByIdSpy.mockResolvedValue(null);

    await expect(
      adminPDFService.updateAdminPDF("nonexistent", { pdfUrl: "/new.pdf" } as any)
    ).rejects.toThrow("Admin PDF not found");

    expect(updateOneAdminPDFSpy).not.toHaveBeenCalled();
  });

  test("deleteAdminPDF - should delete PDF successfully", async () => {
    deleteOneAdminPDFSpy.mockResolvedValue(true);

    const result = await adminPDFService.deleteAdminPDF("p1");

    expect(result).toBe(true);
    expect(deleteOneAdminPDFSpy).toHaveBeenCalledWith("p1");
  });

  test("1deleteAdminPDF - should throw 404 if PDF not found", async () => {
    deleteOneAdminPDFSpy.mockResolvedValue(null);

    await expect(adminPDFService.deleteAdminPDF("nonexistent")).rejects.toThrow(
      "Admin PDF not found or already deleted"
    );
  });
});