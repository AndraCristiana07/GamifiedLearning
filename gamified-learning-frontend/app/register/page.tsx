"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage(){

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState('')
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        setError(null);
        setSuccess('');

        try {
            const res = await fetch("http://localhost:5180/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, email, password})
            });
            if (!res.ok){
                const text = await res.text();
                throw new Error(text || "Register failed");
            }

            const data = await res.json();
            console.log("Registered successful ", data);
            setSuccess("Registered successful")
            setUsername('')
            setEmail('')
            setPassword('')

        } catch (err: unknown) {
            if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred:");
        }
        } 
    }
    return (
    <div>
      <h1>Register</h1>
      {error && <p>{error}</p>}
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="">Sign up here</div>
            {error && <p className="text-red-400 mb-4">{error} </p>}
            {success && <p className="text-green-400 mb-4">{success}</p>}
            <form onSubmit={handleSubmit} action="#" method="POST" className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">Username</label>
                    <div className="mt-2">
                    <input id="username" type="username" name="username" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Email address</label>
                <div className="mt-2">
                <input id="email" type="email" name="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@email.com" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
                    
                </div>
                <div className="mt-2">
                    <input id="password" type="password" name="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>
             <div>
                <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
                    
                </div>
                <div className="mt-2">
                    <input id="password" type="password" name="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <button type="submit" onClick={()=>router.push('login')} className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Register</button>
            </div>
            </form>

            
        </div>
        </div>
    </div>
  );
};