import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "../app/register/page";

global.fetch = jest.fn();

describe("Register Page", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it("renders register form", () => {
        render(<RegisterPage />);

        expect(screen.getByText(/sign up here/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("shows error on failed register", async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            text: () => Promise.resolve("Email already taken"),
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: "Ana" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "ana@example.com" },
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "secret" },
        });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

    });

    it("registers successfully", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    username: "Ana",
                    email: "ana@example.com",
                }),
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/username/i), {
            target: { value: "Ana" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "ana@example.com" },
        });

        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "12345" },
        });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        const success = await screen.findByText(/registered successful/i);
        expect(success).toBeInTheDocument();
    });
});