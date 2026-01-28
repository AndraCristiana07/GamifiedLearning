import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, queryByAttribute } from '@testing-library/react';
import Home from '../app/page';


const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

class IntersectionObserver {
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
})

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'token123'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/users/loggedIn")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ username: "Ana", level: 5, xp: 500 }),
        });
      }
      if (url.includes("/api/challenges/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["Python", "C#"]),
        });
      }
      if (url.includes("/api/challenges")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { challengeId: 1, title: "Sample Challenge", category: "Python", xpGained: 10, difficulty: "Easy" },
          ]),
        });
      }
      if (url.includes("/api/challenges/random")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ challengeId: 1 }),
        });
      }
      if (url.includes("/api/challenges/1/recent")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ challengeId: 1, title: "Sample Challenge", category: "Python", xpGained: 10, difficulty: "Easy" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  it("renders user data after loading", async () => {
    render(<Home />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    const welcome = await screen.findByText(/welcome back/i);
    expect(welcome).toHaveTextContent("Ana");
    expect(screen.getByText(/level 5/i)).toBeInTheDocument();
  });

  it("renders categories and navigates on click", async () => {
    render(<Home />);

    const categoryCard = await screen.findByTestId("category-card-Python");
    fireEvent.click(categoryCard);

    expect(pushMock).toHaveBeenCalledWith("/categories/Python");
  });

  it("handles random challenge navigation", async () => {
    render(<Home />);

    const randomButton = await screen.findByText(/random challenge/i);
    fireEvent.click(randomButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/challenge/1");
    });
  });

  it("opens logout modal", async () => {
    render(<Home />);

    const logoutButton = await screen.findByText(/logout/i);

    fireEvent.click(logoutButton);

    const modalText = await screen.findByText(/are you sure/i);
    expect(modalText).toBeInTheDocument();
  });
});