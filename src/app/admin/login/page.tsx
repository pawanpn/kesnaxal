"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminLoginPage() {
  const { isAdmin, login } = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t0 = Date.now();
    console.log("[Admin Login] Mounted, checking existing session...");

    const timeout = setTimeout(() => {
      if (checking) {
        console.log("[Admin Login] Session check still pending after 3s, isAdmin:", isAdmin);
      }
    }, 3000);

    if (isAdmin) {
      console.log("[Admin Login] Existing session found, redirecting to /admin");
      router.replace("/admin");
    } else {
      console.log("[Admin Login] No active session, showing login form (isAdmin=", isAdmin, ")");
      setChecking(false);
    }

    return () => clearTimeout(timeout);
  }, [isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      console.warn("[Admin Login] Empty email or password submitted");
      return;
    }

    setLoading(true);
    console.log("[Admin Login] Attempting sign in with:", email);

    try {
      const result = await login(email, password);
      if (result.error) {
        console.error("[Admin Login] Login failed:", result.error);
        setError(result.error);
      } else {
        console.log("[Admin Login] Login successful, redirecting...");
        router.replace("/admin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error during login";
      console.error("[Admin Login] Exception:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-10 h-10 mx-auto mb-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-lg font-heading font-bold text-primary">Admin Login</h1>
          <p className="text-xs text-muted mt-1">SuperAdmin Visual CMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="admin@kes.edu.np"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-red-700 font-medium">Login Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-[10px] text-muted text-center mt-4">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
