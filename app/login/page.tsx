"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { betterAuthClient } from "../lib/integrations/better-auth";
const LoginPage = () => {
  const router = useRouter();
  const [loginCreds, setLoginCreds] = useState({ username: "", password: "" });
  const [registerCreds, setRegisterCreds] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async () => {
    if (!loginCreds.username || !loginCreds.password) {
      setError("Please fill in all login fields.");
      return;
    }
    try {
      setError(null);
      await betterAuthClient.signIn.username({
        username: loginCreds.username,
        password: loginCreds.password,
      });
      router.push("/"); 
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login failed:", err);
    }
  };
  const handleRegister = async () => {
    if (
      !registerCreds.username ||
      !registerCreds.password ||
      !registerCreds.email ||
      !registerCreds.name
    ) {
      setError("Please fill in all registration fields.");
      return;
    }
    try {
      setError(null);
      const response = await betterAuthClient.signUp.email({
        email: registerCreds.email,
        password: registerCreds.password,
        username: registerCreds.username,
        name: registerCreds.name,
      });
      if (response) {
        router.push("/"); 
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error("Signup failed:", err);
    }
  };
  return (
    <div className="p-4 text-sm font-sans mt-15">
      {error && <p className="text-red-500 mb-2">{error}</p>}{" "}
     
      <div>
        <h2 className="font-bold">Login</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="login-username">
            Username:{" "}
            <input
              id="login-username"
              type="text"
              value={loginCreds.username}
              onChange={(e) =>
                setLoginCreds({ ...loginCreds, username: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <label htmlFor="login-password">
            Password:{" "}
            <input
              id="login-password"
              type="password"
              value={loginCreds.password}
              onChange={(e) =>
                setLoginCreds({ ...loginCreds, password: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <button
            onClick={handleLogin}
            className="border border-black bg-gray-200 px-1 w-max mt-1"
          >
            Login
          </button>
        </div>
        <p className="mt-2 text-purple-700 underline cursor-pointer w-max">
          Forgot your password?
        </p>
      </div>{" "}
      
      <div className="mt-6">
        <h2 className="font-bold">Create Account</h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-email">
            Email:{" "}
            <input
              id="register-email"
              type="email"
              value={registerCreds.email}
              onChange={(e) =>
                setRegisterCreds({ ...registerCreds, email: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <label htmlFor="register-name">
            Full Name:{" "}
            <input
              id="register-name"
              type="text"
              value={registerCreds.name}
              onChange={(e) =>
                setRegisterCreds({ ...registerCreds, name: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <label htmlFor="register-username">
            Username:{" "}
            <input
              id="register-username"
              type="text"
              value={registerCreds.username}
              onChange={(e) =>
                setRegisterCreds({ ...registerCreds, username: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <label htmlFor="register-password">
            Password:{" "}
            <input
              id="register-password"
              type="password"
              value={registerCreds.password}
              onChange={(e) =>
                setRegisterCreds({ ...registerCreds, password: e.target.value })
              }
              className="border border-gray-500"
            />
          </label>
          <button
            onClick={handleRegister}
            className="border border-black bg-gray-200 px-1 w-max mt-1"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
