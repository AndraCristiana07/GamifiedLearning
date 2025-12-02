import { render, screen, waitFor } from '@testing-library/react';
import CategoryPage from '../app/categories/[category]/page';

jest.mock('next/navigation', () => ({
    __esModule: true,
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        isFallback: false,
    }),
    useSearchParams: () => ({
        get: () => {},
        query: {
            taskId: 'testId',
        },
    }),
    useParams: () => ({
        category: 'Math',
    }),
}));

global.fetch = jest.fn();

describe('Category Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders category title and challenges', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/challenges/category/Math')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { challengeId: 1, title: '1+1?', xpGained: 10, difficulty: 'Easy' },
              { challengeId: 2, title: '2+2?', xpGained: 15, difficulty: 'Easy' },
            ]),
        });
      }
    });

    render(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/Math Challenges/i)).toBeInTheDocument();
      expect(screen.getByText('1+1?')).toBeInTheDocument();
      expect(screen.getByText('2+2?')).toBeInTheDocument();
    });
  });
});