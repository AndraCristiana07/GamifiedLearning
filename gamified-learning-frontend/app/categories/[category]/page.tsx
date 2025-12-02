"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface Challenge {
    challengeId: number;
    title: string;
    difficulty: string;
    xpGained: number;
    completed: boolean;
}

export default function CategoryPage() {

    const { category } = useParams();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const router = useRouter();

    const [difficulty, setDifficulty] = useState("");
    const [tags, setTags] = useState("");
    const [sort, setSort] = useState("");

    async function loadFiltered() {
        const params = new URLSearchParams();

        if (difficulty) params.append("difficulty", difficulty);
        if (tags) params.append("tags", tags);
        if (sort) params.append("sort", sort);

        const res = await fetch(
            `http://localhost:5180/api/challenges/filter?${params.toString()}`
        );

        setChallenges(await res.json());
    }

    useEffect(() => {
        const userId = 1;
        fetch(`http://localhost:5180/api/challenges/category/${encodeURIComponent(category as string)}?userId=${userId}`)
            .then((res) => res.json())
            .then(setChallenges);
    }, [category]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6 capitalize">{decodeURIComponent(category as string)} Challenges</h1>
            <div className="flex justify-end-safe gap-2">
            <select className="bg-gray-800 p-2 rounded ml-2 mb-4  h-10" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>

            <select className="bg-gray-800 p-2 rounded ml-2 mb-4 h-10" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Default</option>
                <option value="xp">XP</option>
                <option value="difficulty">Difficulty</option>
                <option value="title">Alphabetical</option>
            </select>

            <input
                className="bg-gray-700 p-2 rounded h-10"
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />

            <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded h-10" onClick={loadFiltered}>Apply</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((c) => (
                    <div key={c.challengeId} className={`p-4 rounded-lg transition ${c.completed ? "bg-green-800" : "bg-gray-800 hover:bg-gray-700"}`}>
                        <h3 className="font-semibold text-lg">{c.title}</h3>
                        <p className="text-gray-400">{c.difficulty}</p>
                        <p className="text-indigo-400">{c.xpGained} XP</p>
                        {c.completed ? (
                            <div>
                                <p className="text-green-400 font-bold mt-3">✓ Completed</p>
                                <button
                                    onClick={() => router.push(`/challenge/${c.challengeId}`)}
                                    className="mt-3 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded"
                                >
                                    Retry Challenge
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => router.push(`/challenge/${c.challengeId}`)}
                                className="mt-3 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded"
                            >
                                Start Challenge
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}