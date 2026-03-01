import { BookAccessRepository } from "../../../repositories/book-access.repository";
import { BookAccessModel } from "../../../models/book-access.model";
import { BookModel } from "../../../models/book.model";
import { UserModel } from "../../../models/user.model";
import { CategoryModel } from "../../../models/category.model";
import mongoose from "mongoose";

describe("BookAccess Repository Unit Tests", () => {
  let bookAccessRepository: BookAccessRepository;
  let userId: string;
  let bookId: string;
  let categoryId: string;

  beforeAll(async () => {
    bookAccessRepository = new BookAccessRepository();

    const category = await CategoryModel.create({ name: "RepoTestGenre" });
    categoryId = category._id.toString();

    const user = await UserModel.create({
      username: "repotestuser",
      email: "repotest@example.com",
      password: "Password123!",
      phone: "9800000001",
      countryCode: "+977",
    });
    userId = user._id.toString();

    const book = await BookModel.create({
      title: "Repo Test Book",
      author: "Repo Author",
      genre: categoryId,
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/repo.jpg",
      description: "Repo test",
    });
    bookId = book._id.toString();
  });

  afterEach(async () => {
    await BookAccessModel.deleteMany({});
  });

  afterAll(async () => {
    await BookModel.deleteMany({ _id: bookId });
    await UserModel.deleteMany({ _id: userId });
    await CategoryModel.deleteMany({ _id: categoryId });
    await mongoose.connection.close();
  });

  test("should create a new book access", async () => {
    const data = {
      user: userId,
      book: bookId,
      rentedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      isActive: true,
      pdfUrl: "/uploads/pdfs/test.pdf",
    };

    const newAccess = await bookAccessRepository.createBookAccess(data as any);

    expect(newAccess).toBeDefined();
    expect(newAccess.isActive).toBe(true);
    expect(newAccess.pdfUrl).toBe(data.pdfUrl);
  });

  test("should get active book access by user and book", async () => {
    await BookAccessModel.create({
      user: userId,
      book: bookId,
      rentedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      isActive: true,
      pdfUrl: "/uploads/pdfs/test.pdf",
    });

    const found = await bookAccessRepository.getActiveAccessByUserAndBook(userId, bookId);

    expect(found).toBeDefined();
    expect(found?.isActive).toBe(true);
  });
});