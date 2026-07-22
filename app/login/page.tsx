"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password. Please try again.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div
        className="bg-dark-100 border-dark-200 card-shadow flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border p-10"
        id="login-card"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-dark-200 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Image
              src="/icons/logo.png"
              alt="DevEvent logo"
              width={36}
              height={36}
            />
          </div>
          <div className="text-center">
            <h1
              className="text-gradient mb-1 font-bold"
              style={{ fontSize: "1.75rem" }}
            >
              Admin Access
            </h1>
            <p className="text-light-200 text-sm">
              Sign in to manage DevEvent
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-light-100">
            Username
            <input
              id="admin-username"
              type="text"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-dark-200 rounded-[6px] px-5 py-2.5 outline-none ring-primary/40 transition-all focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-light-100">
            Password
            <input
              id="admin-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-dark-200 rounded-[6px] px-5 py-2.5 outline-none ring-primary/40 transition-all focus:ring-2"
            />
          </label>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 mt-2 w-full cursor-pointer rounded-[6px] px-5 py-2.5 font-semibold text-black transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-light-200 text-center text-xs leading-relaxed">
          Only authorised administrators can access this area.
          <br />
          All access attempts are logged.
        </p>
      </div>
    </section>
  );
}
