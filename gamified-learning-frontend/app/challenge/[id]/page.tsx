"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);
  // const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch(`http://localhost:5180/api/challenges/${id}`)
      .then((res) => res.json())
      .then(setChallenge);
  }, [id]);

  console.log(id)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`http://localhost:5180/api/challenges/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1, // TODO: replace with actual user
        challengeId: Number(id),
        answer,
      }),
    });
    const data = await res.json();

    console.log(data)
    if (res.ok) {
      setResult(data.message || "Correct!");
      // if (data.user){
      //   setUser(data.user)
      // }
    } else {
      setResult("Incorrect answer. Try again!");

    }
  }

  if (!challenge) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
      <p className="text-gray-300 mb-6">{challenge.question}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded font-semibold"
        >
          Submit Answer
        </button>
      </form>

      {result && <p className="mt-4 text-lg">{result}</p>}
    </div>
  );
}