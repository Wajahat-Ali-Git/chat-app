"use client";
import { useState } from "react";
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <section className="w-full h-screen flex items-center justify-center">
        <section className="flex flex-col items-center justify-center gap-6">
          <div
            className="flex flex-col
          "
          >
            <h1 className="text-[50px]">Sign Up</h1>
            <p className="text-[20px] opacity-75">Create an account to get started</p>
            <label className="font-bold">Name:</label>
            <input
              id="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
            <label className="font-bold">Email:</label>
            <input
              id="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="font-bold">Password:</label>
            <input
              id="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
             <label className="font-bold">confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
              Sign Up
            </button>
            {email}
            <br />
            {password}
          </div>
        </section>
      </section>
    </>
  );
};
export default SignUp;
