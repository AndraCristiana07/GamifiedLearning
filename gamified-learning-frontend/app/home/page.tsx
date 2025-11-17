"use client";
import {useRouter} from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

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

    fetch("http://localhost:5180/api/challenges/categories")
        .then((res) => res.json())
        .then(setCategories);
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white space-y-8">
      <div>
        <div className="flex justify-between items-center w-full">
          <h1 className="p-4 text-3xl font-bold">Welcome back, {user.username} </h1>
          <h2 className="p-4 text-3xl font-semibold cursor-pointer" 
              onClick={() => router.push(`/profile`)}
          >Profile</h2>
        </div>
        <p>Level {user.level} • {user.xp} XP</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Available Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
            <div
                key={cat}
                onClick={() => router.push(`/categories/${encodeURIComponent(cat)}`)}
                className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition"
            >
                <h3 className="text-lg font-bold capitalize">{cat}</h3>
                <p className="text-gray-400 text-sm">Explore challenges in {cat}</p>
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