"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-marble-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg border border-marble p-8">
        <div className="flex justify-center mb-6">
          <Logo size="md" established="2021" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-black text-center mb-1">Admin Login</h1>
        <p className="text-sm text-medium-grey text-center mb-6">Sign in to manage bookings, services, and content.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          {error && <p className="text-error text-sm bg-error/10 border border-error/30 rounded-sm px-3 py-2">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
