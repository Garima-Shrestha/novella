import { render, screen, fireEvent } from '@testing-library/react';
import BookDetailsCard from '@/app/books-before-renting/_components/BookDetailsCard';

jest.mock('@/lib/actions/book-access-action', () => ({
  handleInitiateKhaltiPayment: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const tBook = {
  _id: 'book_1',
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 500,
  pages: 431,
  description: 'A book about writing clean code.',
  publishedDate: '2008-08-01',
  genre: { _id: 'genre_1', name: 'Technology' },
  coverImageUrl: '',
};

describe('BookDetailsCard', () => {
  test('should display book title, author and description', () => {
    render(<BookDetailsCard book={tBook} />);

    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText(/Robert Martin/)).toBeInTheDocument();
    expect(screen.getByText('A book about writing clean code.')).toBeInTheDocument();
  });

  test('should display book metadata - pages, price, genre', () => {
    render(<BookDetailsCard book={tBook} />);

    expect(screen.getByText('431')).toBeInTheDocument();
    expect(screen.getByText('Rs. 500')).toBeInTheDocument();
    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
  });

  test('should show Rent button initially', () => {
    render(<BookDetailsCard book={tBook} />);

    expect(screen.getByRole('button', { name: /rent/i })).toBeInTheDocument();
  });

  test('should show rent section when Rent button is clicked', () => {
    render(<BookDetailsCard book={tBook} />);

    fireEvent.click(screen.getByRole('button', { name: /rent/i }));

    expect(screen.getByText('Rented Date')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue & pay with khalti/i })).toBeInTheDocument();
  });

  test('should show No Cover when coverImageUrl is empty', () => {
    render(<BookDetailsCard book={{ ...tBook, coverImageUrl: '' }} />);

    expect(screen.getByText('No Cover')).toBeInTheDocument();
  });
});