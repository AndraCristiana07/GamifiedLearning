"use client"
import { useState } from "react";

export default function LoginPage(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5180/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });
            if (!res.ok){
                const text = await res.text();
                throw new Error(text || "Login failed");
            }

            const data = await res.json();
            console.log("Login successful ", data);

        } catch (err) {
            console.error("Login error ", err);
            setError(err.message || "Login error");
        } finally {
            setLoading(false);
        }
    }
    return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="">Log in here</div>
            <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Email address</label>
                <div className="mt-2">
                <input id="email" type="email" name="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@email.com" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
                <div className="text-sm">
                    <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                </div>
                </div>
                <div className="mt-2">
                <input id="password" type="password" name="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Sign in</button>
            </div>
            </form>

            <p className="mt-10 text-center text-sm/6 text-gray-400">
            Don't have an account? 
            <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300"> Register now!</a>
            </p>
        </div>
        </div>
    </div>
  );
};