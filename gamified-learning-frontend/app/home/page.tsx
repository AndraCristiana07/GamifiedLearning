"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // TODO: get user data not just user 1
    fetch("http://localhost:5180/api/users/1") 
      .then((res) => res.json())
      .then(setUser);

    fetch("http://localhost:5180/api/challenges")
      .then((res) => res.json())
      .then(setChallenges);

    fetch("http://localhost:5180/api/users/ordered")
      .then((res) => res.json())
      .then(setLeaderboard);
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.username} </h1>
        <p>Level {user.level} • {user.xp} XP</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((c) => (
            <div key={c.challengeId} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="text-gray-400">
                {c.category} • {c.difficulty}
              </p>
              <p className="text-indigo-400">{c.xpGained} XP</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Leaderboard</h2>
        <ul>
          {leaderboard.map((player, i) => (
            <li key={player.userId} className="flex justify-between border-b border-gray-700 py-2">
              <span>{i + 1}. {player.username}</span>
              <span>{player.xp} XP</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}