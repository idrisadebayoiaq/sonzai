"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { deleteProfile, getProfile, updateProfile } from "@/lib/api";
import { COUNTRIES } from "@/lib/options";

type Profile = {
  id: string;
  display_name?: string | null;
  full_name?: string | null;
  bio?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  credits_remaining?: number;
  created_at?: string;
  updated_at?: string;
};

export default function DashboardProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setDisplayName(p.display_name || "");
        setFullName(p.full_name || "");
        setBio(p.bio || "");
        setCountry(p.country || "");
        setAvatarUrl(p.avatar_url || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateProfile({
        display_name: displayName.trim() || null,
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        country: country || null,
        avatar_url: avatarUrl.trim() || null,
      } as Parameters<typeof updateProfile>[0]);
      setProfile(updated);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    if (!confirm("Clear profile fields (name, bio, avatar)? You can fill them again later.")) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({
        display_name: "Creator",
        full_name: null,
        bio: null,
        avatar_url: null,
        country: null,
      } as Parameters<typeof updateProfile>[0]);
      setProfile(updated);
      setDisplayName("Creator");
      setFullName("");
      setBio("");
      setCountry("");
      setAvatarUrl("");
      setMessage("Profile fields cleared.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSoftDelete() {
    if (!confirm("Soft-delete your profile display data and sign out? Songs are not deleted automatically.")) return;
    try {
      await deleteProfile();
      await signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) return <p className="text-[var(--muted)]">Loading profile…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Profile</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">User profile</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Full create / read / update / delete controls for your public-facing creator profile. Email is managed by
          Supabase Auth and is not editable here.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-xs text-[var(--muted)]">Email</p>
          <p className="mt-2 break-all text-sm">{user?.email}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-[var(--muted)]">Credits</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--accent)]">
            {profile?.credits_remaining ?? "—"}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-[var(--muted)]">User ID</p>
          <p className="mt-2 break-all text-xs text-[var(--muted)]">{profile?.id || user?.id}</p>
        </div>
      </section>

      <form onSubmit={onSave} className="panel max-w-2xl space-y-5 p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Edit profile</h2>

        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Stage name" />
        </label>

        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Full name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional legal / full name" />
        </label>

        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Select…</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Avatar URL</span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </label>

        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-28 resize-y"
            placeholder="Tell listeners what you make…"
            maxLength={500}
          />
        </label>

        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Avatar preview" className="h-20 w-20 rounded-full object-cover border border-[var(--line)]" />
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className="btn-ghost" disabled={saving} onClick={onClear}>
            Clear fields
          </button>
        </div>
        {message && <p className="text-sm text-[var(--accent-2)]">{message}</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </form>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Read (current record)</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Display name" value={profile?.display_name || "—"} />
            <Row label="Full name" value={profile?.full_name || "—"} />
            <Row label="Country" value={profile?.country || "—"} />
            <Row label="Updated" value={profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : "—"} />
            <Row label="Created" value={profile?.created_at ? new Date(profile.created_at).toLocaleString() : "—"} />
          </dl>
          {profile?.bio && <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{profile.bio}</p>}
        </div>
        <div className="panel space-y-4 p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Delete</h3>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Soft-delete clears display fields and signs you out. For full auth account deletion, contact support or use
            Supabase dashboard — that action is irreversible.
          </p>
          <button type="button" className="btn-ghost border-[var(--danger)] text-[var(--danger)]" onClick={onSoftDelete}>
            Soft-delete profile & sign out
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right break-all">{value}</dd>
    </div>
  );
}
