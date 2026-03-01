import { BookRepository } from "../../../repositories/book.repository";
import { BookModel } from "../../../models/book.model";
import { CategoryModel } from "../../../models/category.model";
import mongoose from "mongoose";

describe("Book Repository Unit Tests", () => {
  let bookRepository: BookRepository;
  let categoryId: string;

  beforeAll(async () => {
    bookRepository = new BookRepository();
    const category = await CategoryModel.create({ name: "TestGenre" });
    categoryId = category._id.toString();
  });

  afterEach(async () => {
    await BookModel.deleteMany({});
  });

  afterAll(async () => {
    await CategoryModel.deleteMany({ name: "TestGenre" });
    await mongoose.connection.close();
  });

  test("should create a new book", async () => {
    const bookData = {
      title: "Test Book",
      author: "Test Author",
      genre: categoryId,
      pages: 100,
      price: 10,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/test.jpg",
      description: "Test description",
    };

    const newBook = await bookRepository.createBook(bookData);

    expect(newBook).toBeDefined();
    expect(newBook.title).toBe(bookData.title);
    expect(newBook.author).toBe(bookData.author);
  });

  test("should get book by title case-insensitively", async () => {
    await BookModel.create({
      title: "Case Book",
      author: "Some Author",
      genre: categoryId,
      pages: 120,
      price: 12,
      publishedDate: "2024-01-01",
      coverImageUrl: "/uploads/case.jpg",
      description: "Case test book",
    });

    const found = await bookRepository.getBookByTitle("case book");

    expect(found).toBeDefined();
    expect(found?.title).toBe("Case Book");
    expect(found?.author).toBe("Some Author");
  });
});