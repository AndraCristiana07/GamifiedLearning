"use client"
import { useState, useEffect } from "react"
import { useParams} from "next/navigation";
import {useRouter} from "next/navigation";

export default function CategoryPage(){
    
    const {category} = useParams();
    const [challenges, setChallenges] = useState([]);
    const router = useRouter();
    
   

   useEffect(() => {
    const userId = 1;
    fetch(`http://localhost:5180/api/challenges/category/${encodeURIComponent(category as string)}?userId=${userId}`)
        .then((res) => res.json())
        .then(setChallenges);
}, [category]);

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6 capitalize">{decodeURIComponent(category as string)} Challenges</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((c) => (
                // <div key={c.challengeId} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                //     <h3 className="font-semibold text-lg">{c.title}</h3>
                //     <p className="text-gray-400">{c.difficulty}</p>
                //     <p className="text-indigo-400">{c.xpGained} XP</p>
                //     <button onClick={()=> router.push(`/challenge/${c.challengeId}`)} className="mt-3 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded">
                //     Start Challenge
                //     </button>
                // </div>
                <div key={c.challengeId} className={`p-4 rounded-lg transition ${c.completed ? "bg-green-800" : "bg-gray-800 hover:bg-gray-700"}`}>
                    <h3 className="font-semibold text-lg">{c.title}</h3>
                    <p className="text-gray-400">{c.difficulty}</p>
                    <p className="text-indigo-400">{c.xpGained} XP</p>
                    {c.completed ? (
                        <p className="text-green-400 font-bold mt-3">✓ Completed</p>
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