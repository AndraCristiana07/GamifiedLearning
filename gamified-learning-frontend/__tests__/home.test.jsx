import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/home/page';

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
}));

global.fetch = jest.fn();

describe("Home Page", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders welcome text", async () => {

    fetch.mockImplementation((url) => {
      if (url.includes("/api/users/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            username: "Ana",
            level: 1,
            xp: 100,
          }),
        });
      }
      if (url.includes("/api/challenges")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/api/users/ordered")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/api/challenges/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
    });

    render(<Home />);

    const heading = await screen.findByRole("heading", { level: 1 });

    expect(heading.textContent).toMatch(/welcome back/i);
    expect(heading.textContent).toMatch(/ana/i);
  });
});