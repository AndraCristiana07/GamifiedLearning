import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CategoryPage from '../app/categories/[category]/page';
import { useEffect } from 'react';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockPush,
    isFallback: false,
  }),
  useSearchParams: () => ({
    get: () => { },
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

  it('navigates back home when Home button is clicked', () => {
    render(<CategoryPage />);
    fireEvent.click(screen.getByText(/Home/i));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows "Retry Challenge" and checkmark if challenge is completed', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        { challengeId: 5, title: 'Hard Logic', xpGained: 100, difficulty: 'Hard', completed: true },
      ]),
    });

    render(<CategoryPage />);

    expect(await screen.findByText(/✓ Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry Challenge/i)).toBeInTheDocument();
  });

  it("trigger queries when difficulty filter is applied", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/challenges/difficulty=Easy')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { challengeId: 3, title: '3+3?', xpGained: 20, difficulty: 'Easy' },
          ]),
        });
      }
      if (url.includes('/api/challenges/category/Math')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { challengeId: 1, title: '1+1?', xpGained: 10, difficulty: 'Easy' },
              { challengeId: 2, title: '2+2?', xpGained: 15, difficulty: 'Easy' },
              { challengeId: 3, title: '3+3?', xpGained: 20, difficulty: 'Easy' },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });


    render(<CategoryPage />);
    // simulate selecting 'Easy' filter from dropdown
    fireEvent.change(screen.getByTestId('difficulty-filter'), { target: { value: 'Easy' } });

    await waitFor(() => {
      expect(screen.getByText('3+3?')).toBeInTheDocument();
    });
  });

  it("trigger queries when XP sorting filter is applied", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/challenges/sort=XP')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { challengeId: 3, title: '3+3?', xpGained: 20, difficulty: 'Easy' },
            { challengeId: 2, title: '2+2?', xpGained: 15, difficulty: 'Easy' },
            { challengeId: 1, title: '1+1?', xpGained: 10, difficulty: 'Easy' },
          ]),
        });
      }
      if (url.includes('/api/challenges/category/Math')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { challengeId: 1, title: '1+1?', xpGained: 10, difficulty: 'Easy' },
              { challengeId: 2, title: '2+2?', xpGained: 15, difficulty: 'Easy' },
              { challengeId: 3, title: '3+3?', xpGained: 20, difficulty: 'Easy' },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
    render(<CategoryPage />);
    // simulate selecting 'XP' sort filter from dropdown
    fireEvent.change(screen.getByTestId('sort-filter'), { target: { value: 'XP' } });

    await waitFor(() => {
      const challengeTitles = screen.getAllByTestId('challenge-title').map(el => el.textContent);
      expect(challengeTitles).toEqual(['1+1?', '2+2?', '3+3?']);
    });
  });

  it("trigger queries when tag filter is applied", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/challenges/tags=math')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { challengeId: 1, title: '3+3?', xpGained: 20, difficulty: 'Easy', category: 'Math' },
          ]),
        });
      }
      if (url.includes('/api/challenges/category/Math')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { challengeId: 1, title: '3+3?', xpGained: 20, difficulty: 'Easy', category: 'Math' },

            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });


    render(<CategoryPage />);
    // simulate writing Math in the tags input
    fireEvent.change(screen.getByPlaceholderText(/tags/i), { target: { value: 'math' } });

    await waitFor(() => {
      expect(screen.getByText('3+3?')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('math')).toBeInTheDocument();

  });


  it("navigates to the challenge page when Start Challenge is clicked", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ challengeId: 99, title: 'New Quest', completed: false }]),
    });

    render(<CategoryPage />);

    const startBtn = await screen.findByText(/Start Challenge/i);
    fireEvent.click(startBtn);

    expect(mockPush).toHaveBeenCalledWith("/challenge/99?category=Math");
  });

  it("builds the correct filter URL with parameters", async () => {
    render(<CategoryPage />);

    fireEvent.change(screen.getByTestId('difficulty-filter'), { target: { value: 'Hard' } });
    fireEvent.change(screen.getByPlaceholderText(/tags/i), { target: { value: 'math' } });
    fireEvent.click(screen.getByText(/Apply/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('difficulty=Hard&tags=math')
      );
    });
  });
});


it("updates the tags state and includes them in the filter query", async () => {
    fetch.mockImplementation((url) => {
        console.log("Requested URL:", url);

        if (url.includes('/api/challenges/category/Math')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { challengeId: 10, title: 'Test', difficulty: 'Easy', xpGained: 100 }
                ]),
            });
        }
        if (url.includes('tags=react') || url.includes('tags=math')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    { challengeId: 10, title: 'Test', difficulty: 'Easy', xpGained: 100 }
                ]),
            });
        }
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
        });
    });

    render(<CategoryPage />);

    const tagsInput = screen.getByPlaceholderText(/tags/i);
    fireEvent.change(tagsInput, { target: { value: 'react,math' } });

    const applyBtn = screen.getByText(/Apply/i);
    fireEvent.click(applyBtn);

    const result = await screen.findByText((content, element) => {
        return content.includes('Test');
    });
    expect(result).toBeInTheDocument();
});