"use client";
import { useEffect, useState } from "react";

interface CategoryStat {
  category: string;
  count: number;
}

interface RecentChallenge {
  title: string;
  xpGained: number;
  category: string;
  completedAt: string;
}

interface Profile {
  username: string;
  email: string;
  level: number;
  xp: number;
  totalCompleted: number;
  categoryStats: CategoryStat[];
  recentChallenges: RecentChallenge[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const userId = 1;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5180/api/users/${userId}/profile`)
      .then((res) => res.json())
      .then(setProfile);
  }, [userId]);

  if (!profile) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="p-6 text-white space-y-8">
      <section className="bg-gray-800 p-4 rounded-lg">
        <h1 className="text-3xl font-bold">{profile.username}</h1>
        <p className="text-gray-300">{profile.email}</p>
        <p className="mt-2 text-lg">
          Level <span className="font-semibold">{profile.level}</span> • {profile.xp} XP
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.totalCompleted}</p>
            <p className="text-gray-400 text-sm">Challenges Completed</p>
          </div>

          {profile.categoryStats.map((c) => (
            <div key={c.category} className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-xl font-bold">{c.count}</p>
              <p className="text-gray-400 text-sm">{c.category}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>

        <div className="space-y-3">
          {profile.recentChallenges.map((c, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between">
                <p className="font-semibold">{c.title}</p>
                <p className="text-indigo-400">{c.xpGained} XP</p>
              </div>
              <p className="text-gray-400 text-sm">{c.category}</p>
              <p className="text-gray-500 text-sm">
                Completed: {new Date(c.completedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}