"use client";

import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <section className="w-full h-screen flex items-center justify-center">
        <section className="flex flex-col md:w-[400px] items-center justify-center gap-6">
          <div
            className="flex flex-col
          "
          >
            <h1 className="text-[50px]">Login</h1>
            <p className="text-[20px] opacity-75">Sign in to your account</p>
            <label className="font-bold">Email: </label>
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
            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
              Login
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
export default Login;
