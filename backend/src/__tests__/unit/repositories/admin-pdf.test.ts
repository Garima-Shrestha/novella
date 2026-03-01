import { AdminPDFRepository } from "../../../repositories/admin-pdf.repository";
import { AdminPDFModel } from "../../../models/admin-pdf.model";
import { BookModel } from "../../../models/book.model";
import { CategoryModel } from "../../../models/category.model";
import mongoose from "mongoose";

describe("AdminPDF Repository Unit Tests", () => {
  let adminPDFRepository: AdminPDFRepository;
  let bookId: string;
  let categoryId: string;

  beforeAll(async () => {
    adminPDFRepository = new AdminPDFRepository();

    const category = await CategoryModel.create({ name: "PDFRepoGenre" });
    categoryId = category._id.toString();

    const book = await BookModel.create({
      title: "PDF Repo Book",
      author: "PDF Repo Author",
      genre: categoryId,
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/book.jpg",
      description: "PDF repo test",
    });
    bookId = book._id.toString();
  });

  afterEach(async () => {
    await AdminPDFModel.deleteMany({});
  });

  afterAll(async () => {
    await BookModel.deleteMany({ _id: bookId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await mongoose.connection.close();
  });

  test("should create a new admin PDF", async () => {
    const data = {
      book: bookId,
      pdfUrl: "/uploads/pdfs/test.pdf",
      isActive: true,
    };

    const newPDF = await adminPDFRepository.createAdminPDF(data as any);

    expect(newPDF).toBeDefined();
    expect(newPDF.pdfUrl).toBe(data.pdfUrl);
    expect(newPDF.isActive).toBe(true);
  });

  test("should get active PDF by book", async () => {
    await AdminPDFModel.create({
      book: bookId,
      pdfUrl: "/uploads/pdfs/active.pdf",
      isActive: true,
    });

    const found = await adminPDFRepository.getActivePdfByBook(bookId);

    expect(found).toBeDefined();
    expect(found?.isActive).toBe(true);
    expect(found?.pdfUrl).toBe("/uploads/pdfs/active.pdf");
  });
});