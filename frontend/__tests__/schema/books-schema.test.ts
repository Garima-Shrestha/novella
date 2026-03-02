import { FetchBooksSchema, FetchBookByIdSchema } from '@/app/books-before-renting/schema';

describe('FetchBooksSchema', () => {
  test('should pass with valid params', () => {
    const result = FetchBooksSchema.safeParse({ page: 1, size: 10 });
    expect(result.success).toBe(true);
  });

  test('should pass with no params since all are optional', () => {
    const result = FetchBooksSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('should pass with searchTerm', () => {
    const result = FetchBooksSchema.safeParse({ searchTerm: 'clean code' });
    expect(result.success).toBe(true);
  });

  test('should fail when page is not a positive number', () => {
    const result = FetchBooksSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });
});

describe('FetchBookByIdSchema', () => {
  test('should pass with valid 24 character hex id', () => {
    const result = FetchBookByIdSchema.safeParse({ id: '507f1f77bcf86cd799439011' });
    expect(result.success).toBe(true);
  });

  test('should fail with invalid id format', () => {
    const result = FetchBookByIdSchema.safeParse({ id: 'invalid-id' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid book ID');
  });

  test('should fail with empty id', () => {
    const result = FetchBookByIdSchema.safeParse({ id: '' });
    expect(result.success).toBe(false);
  });
});