import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
  }),
}));

global.fetch = jest.fn();

describe("Home Page", () => {
  beforeEach(() => {
    fetch.mockClear();
    pushMock.mockClear();
  });

  it("loads categories and navigates on click", async () => {

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
      if (url.includes("/api/challenges/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["C#"]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(<Home />);
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/welcome back/i);
    expect(heading.textContent).toMatch(/ana/i);

    const category = await screen.findByText(/C\#/i, { selector: "h3" });
    expect(category).toBeInTheDocument();

    fireEvent.click(category);

    expect(pushMock).toHaveBeenCalledWith("/categories/C%23");
  });
});