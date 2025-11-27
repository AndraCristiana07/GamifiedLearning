import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "../app/login/page";

global.fetch = jest.fn();

describe("Login Page", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it("renders login form", () => {
        render(<LoginPage />);

        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("shows error on failed login", async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            text: () => Promise.resolve("Invalid credentials"),
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: {value: "wrong@example.com"},
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: {value: "badpass"},
        });

        fireEvent.click(screen.getByRole("button", {name: /sign in/i}));

        const err = await screen.findByText(/invalid credentials/i);
        expect(err).toBeInTheDocument();
    });

    it("logs in successfully", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    email: "ana@example.com",
                    token: "abc123",
                }),
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: {value: "ana@example.com"},
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: {value: "pass123"},
        });

        fireEvent.click(screen.getByRole("button", {name: /sign in/i}));

        await waitFor(() => {
            // no error
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
    });
});