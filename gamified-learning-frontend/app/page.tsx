"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CategoryCard from "@/components/cardcomponent";
import LogoutModal from "@/components/logoutModal";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const router = useRouter();

  const specificHues: { [key: string]: { hueA: number, hueB: number } } = {
    'Python': { hueA: 180, hueB: 280 },
    'Cpp': { hueA: 260, hueB: 360 },
    'CSharp': { hueA: 340, hueB: 50 },
    // 'JavaScript': { hueA: 60, hueB: 160 },

  };

  function loggingOut() {
    localStorage.removeItem("token")
    setUser(null)
    router.push('/login')
  }



  const coloredCategories = categories.map((cat, i) => {
    if (specificHues[cat]) {
      return {
        cat,
        hueA: specificHues[cat].hueA,
        hueB: specificHues[cat].hueB,
      };
    } else {
      return {
        cat,
        hueA: i * 10 + 10,
        hueB: i * 60 + 50,
      };
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }
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

    // fetch(`http://localhost:5180/api/users/1`)
    fetch(`http://localhost:5180/api/users/loggedIn`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) router.push("/login");
        return res.json()
      })
      .then(setUser);

    fetch("http://localhost:5180/api/users/ordered")
      .then((res) => res.json())
      .then(setLeaderboard);

    fetch("http://localhost:5180/api/challenges/categories")
      .then((res) => res.json())
      .then(setCategories);


  }, [router]);

  function handleRandomChallenge() {
    if (randomChallenge) {
      router.push(`/challenge/${randomChallenge.challengeId}`)
    } else {
      alert("No challenges found!")
    }

  }
  if (!user) return <p className="text-white p-6">Loading...</p>;

  return (
    <><LogoutModal
      open={showLogoutModal}
      onCancel={() => setShowLogoutModal(false)}
      onConfirm={() => {
        setShowLogoutModal(false);
        loggingOut();
      }} /><div className="relative p-6 text-white space-y-12">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="text-indigo-400">{user.username}</span>
            </h1>

            <div className="flex gap-6 items-center">
              {user ? (
                <motion.div
                  id="logout-button"
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer text-2xl font-semibold"
                  onClick={() => setShowLogoutModal(true)}
                >
                  Logout
                </motion.div>

              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer text-2xl font-semibold"
                  onClick={() => router.push(`/login`)}

                >
                  Login
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer text-2xl font-semibold"
                onClick={() => router.push(`/profile`)}
              >
                Profile
              </motion.div>
            </div>
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
          <button>🎲 Random Challenge</button>
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
          <div className="grid grid-cols-1 gap-12">
            {coloredCategories.map(({ cat, hueA, hueB }, i) => (
              <div
                key={cat}
                data-testid={`category-card-${cat}`}
                onClick={() => router.push(`/categories/${encodeURIComponent(cat)}`)}
                className="cursor-pointer"
              >

                <CategoryCard i={i} category={cat} hueA={hueA} hueB={hueB} />
              </div>
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
      </div></>
  );
}