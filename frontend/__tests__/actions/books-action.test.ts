import { handleFetchAllBooks, handleFetchBookById } from '@/lib/actions/books-before-renting-action';

jest.mock('@/lib/api/books-before-renting', () => ({
  fetchAllBooks: jest.fn(),
  fetchBookById: jest.fn(),
}));

import { fetchAllBooks, fetchBookById } from '@/lib/api/books-before-renting';
const mockedFetchAllBooks = fetchAllBooks as jest.MockedFunction<typeof fetchAllBooks>;
const mockedFetchBookById = fetchBookById as jest.MockedFunction<typeof fetchBookById>;

const tBook = {
  _id: 'book_1',
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 500,
  pages: 431,
  description: 'A book about clean code',
  publishedDate: '2008-08-01',
  genre: { _id: 'genre_1', name: 'Technology' },
  coverImageUrl: '/uploads/clean_code.jpg',
};

describe('handleFetchAllBooks', () => {
  test('should return success with books and pagination', async () => {
    mockedFetchAllBooks.mockResolvedValueOnce({
      success: true,
      data: [tBook],
      pagination: { total: 1 },
    });

    const result = await handleFetchAllBooks({ page: 1, size: 10 });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({ total: 1 });
  });

  test('should return failure when no books found', async () => {
    mockedFetchAllBooks.mockResolvedValueOnce({
      success: false,
    });

    const result = await handleFetchAllBooks();

    expect(result.success).toBe(false);
    expect(result.message).toBe('No books found');
  });

  test('should return failure when fetchAllBooks throws', async () => {
    mockedFetchAllBooks.mockRejectedValueOnce(new Error('Network error'));

    const result = await handleFetchAllBooks();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Network error');
  });
});

describe('handleFetchBookById', () => {
  test('should return success with book data', async () => {
    mockedFetchBookById.mockResolvedValueOnce({
      success: true,
      data: tBook,
    });

    const result = await handleFetchBookById('book_1');

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Clean Code');
  });

  test('should return failure when book not found', async () => {
    mockedFetchBookById.mockResolvedValueOnce({
      success: false,
    });

    const result = await handleFetchBookById('invalid_id');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Book not found');
  });

  test('should return failure when fetchBookById throws', async () => {
    mockedFetchBookById.mockRejectedValueOnce(new Error('Fetch book by ID failed'));

    const result = await handleFetchBookById('book_1');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Fetch book by ID failed');
  });
});