"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Edit2,
  Save,
  X,
  Loader2,
  Calendar,
  Award,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils/chess";
import type { UserProfile } from "@/lib/types/chess";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/profile");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          display_name: profileData.display_name || "",
          bio: profileData.bio || "",
        });
      }

      setIsLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editForm.display_name,
        bio: editForm.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error && profile) {
      setProfile({
        ...profile,
        display_name: editForm.display_name,
        bio: editForm.bio,
      });
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy hồ sơ</p>
        </main>
      </div>
    );
  }

  const winRate =
    profile.games_played > 0
      ? ((profile.games_won / profile.games_played) * 100).toFixed(1)
      : "0";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {/* Profile Header */}
          <div className="glass mb-8 rounded-xl p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, display_name: e.target.value })
                      }
                      placeholder="Tên hiển thị"
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-primary focus:outline-none"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      placeholder="Giới thiệu bản thân..."
                      rows={3}
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2 focus:border-primary focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Lưu
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
                      >
                        <X className="h-4 w-4" />
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <h1 className="text-2xl font-bold">
                        {profile.display_name || profile.username}
                      </h1>
                      {profile.is_admin && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                    {profile.username && (
                      <p className="text-muted-foreground">
                        @{profile.username}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {profile.bio}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
                      <Calendar className="h-4 w-4" />
                      <span>Tham gia {formatDate(profile.created_at)}</span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-all hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4" />
                      Chỉnh sửa hồ sơ
                    </button>
                  </>
                )}
              </div>

              {/* Rating Badge */}
              <div className="text-center">
                <div
                  className={cn(
                    "inline-flex flex-col items-center rounded-xl p-4",
                    profile.rating >= 1500
                      ? "bg-success/10"
                      : profile.rating >= 1200
                        ? "bg-primary/10"
                        : "bg-secondary"
                  )}
                >
                  <TrendingUp
                    className={cn(
                      "h-6 w-6",
                      profile.rating >= 1500
                        ? "text-success"
                        : profile.rating >= 1200
                          ? "text-primary"
                          : "text-muted-foreground"
                    )}
                  />
                  <span className="mt-1 text-2xl font-bold">
                    {profile.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.games_played}</p>
                <p className="text-sm text-muted-foreground">Ván đấu</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.games_won}</p>
                <p className="text-sm text-muted-foreground">Thắng</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.games_lost}</p>
                <p className="text-sm text-muted-foreground">Thua</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Award className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-sm text-muted-foreground">Tỷ lệ thắng</p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="glass rounded-xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Chi tiết thống kê</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ván hòa</span>
                <span className="font-medium">{profile.games_drawn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tỷ lệ hòa</span>
                <span className="font-medium">
                  {profile.games_played > 0
                    ? (
                        (profile.games_drawn / profile.games_played) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Điểm trung bình/ván</span>
                <span className="font-medium">
                  {profile.games_played > 0
                    ? (
                        (profile.rating - 1200) /
                        Math.max(1, profile.games_played)
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
