import { render, screen, fireEvent } from '@testing-library/react';
import ChallengePage from '../app/challenge/[id]/page';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => { },
    query: {
      category: 'Math',
    },
  }),
  useParams: () => ({
    id: '1',
  }),

}));

global.fetch = jest.fn();

describe('Challenge Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should load challenge and handle correct and incorrect answers', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/skel/')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('// Code Skeleton'),
        });
      }

      if (url.includes('/api/challenges/1') && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            challengeId: 1,
            title: 'What is 1 + 1?',
            question: 'Calculate 1 + 1',
            type: 'Text',
            xpGained: 10,
            hintPenalty: 5
          }),
        });
      }

      if (url.includes('/submit')) {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: body.answer === '2' ? 'Correct! XP awarded.' : 'Incorrect answer.'
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve({}),
      });
    });

    render(<ChallengePage />);

    expect(await screen.findByText('What is 1 + 1?')).toBeInTheDocument();

    // correct answer
    const input = screen.getByPlaceholderText(/your answer/i);
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('Submit Answer'));

    expect(await screen.findByText('Correct! XP awarded.')).toBeInTheDocument();

    // incorrect answer
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.click(screen.getByText('Submit Answer'));

    expect(await screen.findByText('Incorrect answer.')).toBeInTheDocument();
  });

  it('restore to skeleton view on clicking Show Skeleton', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/skel/')) {
        return Promise.resolve({
          ok: true,
          text: async () => '// Code Skeleton',
        });
      }

      if (url.includes('/api/challenges/1') && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            challengeId: 1,
            title: 'What is 1 + 1?',
            question: 'Calculate 1 + 1',
            type: 'Code',
            xpGained: 10,
            hintPenalty: 5
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        text: async () => '',
        json: async () => ({}),
      });
    });

    render(<ChallengePage />);

    expect(await screen.findByText('What is 1 + 1?')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('restore-skeleton'));

    await screen.findByText('What is 1 + 1?');
  });

  it('should display hint and apply penalty', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/skel/')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('// Code Skeleton'),
        });
      }

      if (url.includes('/api/challenges/1') && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            challengeId: 1,
            title: 'What is 1 + 1?',
            question: 'Calculate 1 + 1',
            type: 'Code',
            xpGained: 10,
            hintPenalty: 5
          }),
        });
      }

      if (url.includes('/api/challenges/1/hint')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            hint: 'It is the sum of one and one.',
            message: 'Hint provided'
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve({}),
      });
    });

    render(<ChallengePage />);

    expect(await screen.findByText('What is 1 + 1?')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('show-hint'));

    expect(await screen.findByText('It is the sum of one and one.')).toBeInTheDocument();
  });

  it('should set programming language', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/skel/')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('// Code Skeleton'),
        });
      }

      if (url.includes('/api/challenges/1') && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            challengeId: 1,
            title: 'What is 1 + 1?',
            question: 'Calculate 1 + 1',
            type: 'Code',
            xpGained: 10,
            hintPenalty: 5,
            supportedLanguages: ['python', 'javascript']
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
        json: () => Promise.resolve({}),
      });
    });

    render(<ChallengePage />);

    expect(await screen.findByText('What is 1 + 1?')).toBeInTheDocument();

    const languageSelect = screen.getByTestId('language-select');
    fireEvent.change(languageSelect, { target: { value: 'javascript' } });

    expect(languageSelect.value).toBe('javascript');
  });
});