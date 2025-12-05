"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface UserData {
  username: string;
  level: number;
  xp: number;
}

interface LeaderboardUser {
  userId: number;
  username: string;
  xp: number;
}

interface RecentEntry {
  completedAt: string;
  title: string;
  category: string;
  difficulty: string;
  xpGained: number;
}

interface Challenge {
  challengeId: number;
  title: string;
  category: string;
  difficulty: string;
  xpGained: number;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Challenge[]>([]);
  const [randomChallenge, setRandomChallenge] = useState<Challenge>();
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:5180/api/challenges/1/recent`)
      .then((r) => r.json())
      .then(setRecent);

    fetch("http://localhost:5180/api/challenges")
      .then((r) => r.json())
      .then((list) => {
        const shuffled = list.sort(() => Math.random() - 0.5);
        setRecommended(shuffled.slice(0, 3));
      });

    fetch("http://localhost:5180/api/challenges")
      .then((r) => r.json())
      .then((list) => {
        const random = list.sort(() => Math.random() - 0.5)[0];
        setRandomChallenge(random);
      });

    fetch("http://localhost:5180/api/users/1")
      .then((res) => res.json())
      .then(setUser);

    fetch("http://localhost:5180/api/users/ordered")
      .then((res) => res.json())
      .then(setLeaderboard);

    fetch("http://localhost:5180/api/challenges/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function handleRandomChallenge() {
    if (randomChallenge) {
      router.push(`/challenge/${randomChallenge.challengeId}`)
    } else {
      alert("No challenges found!")
    }

  }
  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="relative p-6 text-white space-y-12">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">
            Welcome back, <span className="text-indigo-400">{user.username}</span>
          </h1>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer text-2xl font-semibold"
            onClick={() => router.push(`/profile`)}
          >
            Profile
          </motion.div>
        </div>
        <p className="text-gray-300 mt-2">
          Level {user.level} • {user.xp} XP
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03 }}
        className="cursor-pointer bg-blue-600 hover:bg-blue-500 p-6 rounded-xl text-center font-semibold shadow-lg shadow-blue-600/20"
        onClick={handleRandomChallenge}
      >
        <button >🎲 Random Challenge</button>
      </motion.div>

      <section>
        <h2 className="text-3xl font-semibold mb-4">🔥 Recommended for You</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.map((c, i) => (
            <motion.div
              key={c.challengeId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
              onClick={() => router.push(`/challenge/${c.challengeId}`)}
            >
              <h3 className="font-bold text-xl">{c.title}</h3>
              <p className="text-indigo-300">{c.category}</p>
              <p className="text-sm text-gray-400 mt-1">{c.difficulty}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">📚 Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgb(55 65 81)" }}
              className="p-6 bg-gray-800 rounded-xl cursor-pointer transition"
              onClick={() =>
                router.push(`/categories/${encodeURIComponent(cat)}`)
              }
            >
              <h3 className="text-lg font-bold capitalize">{cat}</h3>
              <p>View challenges</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">⏳ Recent Activity</h2>

        <div className="space-y-3">
          {recent.length === 0 && (
            <p className="text-gray-400">You haven’t completed anything yet.</p>
          )}

          {recent.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 p-4 rounded-xl flex justify-between border border-gray-700"
            >
              <div>
                <p className="font-bold">{r.title}</p>
                <p className="text-sm text-gray-400">
                  {r.category} • {r.difficulty}
                </p>
              </div>
              <p className="text-green-400 font-semibold">+{r.xpGained} XP</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🏆 Leaderboard</h2>

        <ul className="space-y-2">
          {leaderboard.map((player, i) => (
            <motion.li
              key={player.userId}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-between border-b border-gray-700 py-2"
            >
              <span>
                {i + 1}. <span className="text-indigo-300">{player.username}</span>
              </span>
              <span className="text-green-400">{player.xp} XP</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}