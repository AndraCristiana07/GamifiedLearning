"use client"
import { useState } from "react";

export default function LoginPage(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    // TODO: hanfdle submit 
     
    return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
      {/* on submit for form */}

        <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div class="">Log in here</div>
            <form action="#" method="POST" class="space-y-6">
            <div>
                <label for="email" class="block text-sm/6 font-medium text-gray-100">Email address</label>
                <div class="mt-2">
                <input id="email" type="email" name="email" required autocomplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@email.com" class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between">
                <label for="password" class="block text-sm/6 font-medium text-gray-100">Password</label>
                <div class="text-sm">
                    <a href="#" class="font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                </div>
                </div>
                <div class="mt-2">
                <input id="password" type="password" name="password" required autocomplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}  class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                </div>
            </div>

            <div>
                <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Sign in</button>
            </div>
            </form>

            <p class="mt-10 text-center text-sm/6 text-gray-400">
            Don't have an account? 
            <a href="#" class="font-semibold text-indigo-400 hover:text-indigo-300"> Register now!</a>
            </p>
        </div>
        </div>
    </div>
  );
};