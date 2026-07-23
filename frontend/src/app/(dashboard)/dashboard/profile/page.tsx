"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authApi.updateMyProfile({ name });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="mt-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="text-sm font-medium">
              Full name
            </label>
            <input id="profile-name" className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="profile-email" className="text-sm font-medium">
              Email
            </label>
            <input id="profile-email" className="input mt-1 opacity-60" value={user.email} disabled />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} isLoading={saving}>
              Save changes
            </Button>
            {saved && <span className="text-sm text-emerald-600">Saved!</span>}
          </div>
        </div>
      </Card>
    </div>
  );
}
