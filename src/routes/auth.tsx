import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Sign Up — Campus Lost & Found" },
      {
        name: "description",
        content:
          "Create an account or log in to report lost and found items on campus and keep track of what you posted.",
      },
      { property: "og:title", content: "Sign In or Sign Up — Campus Lost & Found" },
      {
        property: "og:description",
        content:
          "Create an account or log in to report lost and found items on campus and keep track of what you posted.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/", replace: true });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const mail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(mail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) {
          setError(err.message);
          return;
        }
        if (!data.session) {
          setNotice("Almost there — check your email to confirm your account, then log in.");
          setMode("login");
          setPassword("");
          return;
        }
        toast.success("Account created. You're signed in.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (err) {
          setError(
            err.message.toLowerCase().includes("invalid login")
              ? "That email and password don't match. Please try again."
              : err.message,
          );
          return;
        }
        toast.success("Welcome back!");
      }
      void navigate({ to: "/", replace: true });
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Search className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold">Campus Lost &amp; Found</span>
      </Link>

      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold">
          {mode === "login" ? "Log in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Log in to report items and mark them claimed."
            : "Sign up with your email to start posting items."}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="a-email">
              Email
            </label>
            <input
              id="a-email"
              type="email"
              autoComplete="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="a-pass">
              Password
            </label>
            <input
              id="a-pass"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm font-medium text-found-foreground">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setNotice("");
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </form>

      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:underline">
        Continue browsing without an account
      </Link>
    </div>
  );
}
