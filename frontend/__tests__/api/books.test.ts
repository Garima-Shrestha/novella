import { fetchAllBooks, fetchBookById } from '@/lib/api/books-before-renting';

jest.mock('@/lib/api/axios', () => ({
  get: jest.fn(),
}));

import axios from '@/lib/api/axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

describe('fetchAllBooks', () => {
  test('should return data on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: [tBook], pagination: { total: 1 } },
    });

    const result = await fetchAllBooks({ page: 1, size: 10 });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/books/', {
      params: { page: 1, size: 10 },
    });
  });

  test('should throw error on failure', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: 'Fetch failed' } },
    });

    await expect(fetchAllBooks()).rejects.toThrow('Fetch failed');
  });
});

describe('fetchBookById', () => {
  test('should return book data on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { success: true, data: tBook },
    });

    const result = await fetchBookById('book_1');

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Clean Code');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/books/book_1');
  });

  test('should throw error when book not found', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: 'Book not found' } },
    });

    await expect(fetchBookById('invalid_id')).rejects.toThrow('Book not found');
  });
});