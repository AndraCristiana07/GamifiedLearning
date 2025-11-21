import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import ProfilePage from "../app/profile/page";

global.fetch = jest.fn();

describe("Profile Page", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it("renders and loads profile data", async () => {
        fetch.mockImplementation((url) => {
            if (url.includes("/api/users/1/profile")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            username: "Ana",
                            email: "ana@example.com",
                            level: 3,
                            xp: 150,
                            totalCompleted: 12,
                            categoryStats: [{ category: "C#", count: 5 }],
                            recentChallenges: [
                                {
                                    title: "Arrays",
                                    xpGained: 20,
                                    category: "C#",
                                    completedAt: new Date().toISOString(),
                                },
                            ],
                        }),
                });
            }


        });

        render(<ProfilePage />);

        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();

        expect(await screen.findByText("Ana")).toBeInTheDocument();
        expect(screen.getByText("ana@example.com")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument(); //totalCompleted

        const statsSection = screen.getByRole('heading', { name: /your stats/i }).parentElement;
        expect(within(statsSection).getByText(/c\#/i)).toBeInTheDocument();

        expect(screen.getByText(/arrays/i)).toBeInTheDocument(); //recent challenges
    });
});