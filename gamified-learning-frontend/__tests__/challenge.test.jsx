import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChallengePage from '../app/challenge/[id]/page';

jest.mock('next/navigation', () => ({
    __esModule: true,
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
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

  it('renders challenge and submits answer', async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes('/api/challenges/1') && (!options || options.method === 'GET')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              challengeId: 1,
              title: 'What is 1 + 1?',
              question: 'Calculate 1 + 1',
              xpGained: 10,
            }),
        });
      }

      if (url.includes('/api/challenges/1/submit') && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        if (body.answer === '2') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Correct! XP awarded.' }),
          });
        } else {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'Incorrect answer.' }),
          });
        }
      }
    });

    render(<ChallengePage />);

    await waitFor(() => {
      expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
      expect(screen.getByText('Calculate 1 + 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your answer...'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Correct! XP awarded.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your answer...'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Submit Answer'));

    await waitFor(() => {
      expect(screen.getByText('Incorrect answer. Try again!')).toBeInTheDocument();
    });
  });
});