"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/api";

export default function DashboardSettingsPage() {
  const { user, signOut } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notifyProduct, setNotifyProduct] = useState(true);
  const [notifyCredits, setNotifyCredits] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState("NG");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmail(user?.email || "");
    getProfile()
      .then((p) => {
        setCredits(p.credits_remaining ?? 0);
        if (p.country) setDefaultCountry(p.country);
      })
      .catch(() => undefined);

    try {
      const raw = localStorage.getItem("sonzai_settings");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          notifyProduct?: boolean;
          notifyCredits?: boolean;
          defaultCountry?: string;
        };
        if (typeof parsed.notifyProduct === "boolean") setNotifyProduct(parsed.notifyProduct);
        if (typeof parsed.notifyCredits === "boolean") setNotifyCredits(parsed.notifyCredits);
        if (parsed.defaultCountry) setDefaultCountry(parsed.defaultCountry);
      }
    } catch {
      // ignore
    }
  }, [user]);

  function savePrefs() {
    localStorage.setItem(
      "sonzai_settings",
      JSON.stringify({ notifyProduct, notifyCredits, defaultCountry }),
    );
    setMessage("Preferences saved on this device.");
  }

  async function onUpdateEmail(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ email: email.trim() });
      if (err) throw err;
      setMessage("Email update requested. Check your inbox if confirmation is required.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setPassword("");
      setConfirm("");
      setMessage("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Settings</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">Account & studio settings</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Manage authentication, credit visibility, generation preferences, and session controls. Generation always uses
          AceMusic when the server key is configured — there is no demo fallback in production.
        </p>
      </div>

      {message && <p className="text-sm text-[var(--accent-2)]">{message}</p>}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Credits remaining</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--accent)]">
            {credits === null ? "—" : credits}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">1 credit = 1 successful real song generation.</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Engine</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">AceMusic</p>
          <p className="mt-3 text-sm text-[var(--muted)]">ACE-Step via api.acemusic.ai — lyrics-aware vocal songs.</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Session</p>
          <p className="mt-3 break-all text-sm">{user?.email}</p>
          <button type="button" className="btn-ghost mt-4 !px-3 !py-1.5 text-sm" onClick={() => signOut()}>
            Log out everywhere (this browser)
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onUpdateEmail} className="panel space-y-4 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Change email</h2>
          <p className="text-sm text-[var(--muted)]">Updates your Supabase Auth email. Confirmation may be required.</p>
          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary" disabled={saving}>
            Update email
          </button>
        </form>

        <form onSubmit={onUpdatePassword} className="panel space-y-4 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Change password</h2>
          <p className="text-sm text-[var(--muted)]">Minimum 6 characters. You stay signed in after the change.</p>
          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">New password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Confirm password</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={saving}>
            Update password
          </button>
        </form>
      </section>

      <section className="panel space-y-5 p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Studio preferences</h2>
        <p className="text-sm text-[var(--muted)]">Stored in this browser for convenience (not synced to the server yet).</p>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={notifyProduct}
            onChange={(e) => setNotifyProduct(e.target.checked)}
            className="mt-1 accent-[var(--accent)]"
          />
          <span>Show product tips on the dashboard overview</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={notifyCredits}
            onChange={(e) => setNotifyCredits(e.target.checked)}
            className="mt-1 accent-[var(--accent)]"
          />
          <span>Highlight low credits (under 5) in the sidebar</span>
        </label>
        <label className="field block max-w-xs text-sm">
          <span className="mb-2 block text-[var(--muted)]">Preferred default country code</span>
          <input value={defaultCountry} onChange={(e) => setDefaultCountry(e.target.value.toUpperCase())} maxLength={2} />
        </label>
        <button type="button" className="btn-ghost" onClick={savePrefs}>
          Save preferences
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Generation policy</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            DEMO_MODE is off. If AceMusic is unavailable, jobs fail loudly instead of returning unrelated beep audio.
          </p>
        </div>
        <div className="panel p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Voice samples</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Optional uploads go to your private voice-samples bucket. Only upload voices you own or have rights to use.
          </p>
        </div>
        <div className="panel p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Data export</h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Use Library to download tracks via the audio player. Job history is available under History with full style
            metadata.
          </p>
        </div>
      </section>
    </div>
  );
}
