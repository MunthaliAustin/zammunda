"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import Link from "next/link";

export default function AgentSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Agent logging in: ${username}`);
    // Add agent auth logic here
  };

  return (
     <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Agent Login</h2>
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <Logo />
        <form onSubmit={handleSubmit} className="flex flex-col">
          <InputField
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={setUsername}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <PrimaryButton label="Sign In as Agent" type="submit" />
        </form>
         {/* ✅ ONLY forgot password inside the box */}
        <div className="mt-4 text-sm text-blue-600 text-center">
          <Link href="/reset-password/buyer" className="hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>
       {/* ✅ Divider + New to Zakumunda + Create account outside the box */}
      <div className="w-full max-w-md flex flex-col items-center mt-6">
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-black text-sm">New to Zakumunda?</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <Link 
          href="/signup/buyer"
          className="mt-4 w-full text-center border border-gray-400 py-2 rounded-full hover:bg-gray-50 block text-blue-600 hover:underline"
          >
            Create your Zakumunda account
       </Link>
 
      </div>
    </main>
  );
}
