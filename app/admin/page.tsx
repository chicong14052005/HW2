import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Users,
  Trophy,
  Gamepad2,
  TrendingUp,
  Shield,
  User,
  Ban,
  CheckCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils/chess";

async function getAdminStats() {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!user.user_metadata?.is_admin) {
    redirect("/");
  }

  // Get stats
  const [profilesResult, gamesResult] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("games").select("*"),
  ]);

  const profiles = profilesResult.data || [];
  const games = gamesResult.data || [];

  const totalUsers = profiles.length;
  const totalGames = games.length;
  const activeGames = games.filter((g) => g.status === "active").length;
  const completedGames = games.filter((g) => g.status !== "active").length;
  const avgRating =
    profiles.length > 0
      ? Math.round(
          profiles.reduce((sum, p) => sum + p.rating, 0) / profiles.length
        )
      : 1200;

  return {
    user,
    profiles,
    games,
    stats: {
      totalUsers,
      totalGames,
      activeGames,
      completedGames,
      avgRating,
    },
  };
}

export default async function AdminPage() {
  const { profiles, stats } = await getAdminStats();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Người dùng</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Gamepad2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
                <p className="text-sm text-muted-foreground">Tổng ván đấu</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeGames}</p>
                <p className="text-sm text-muted-foreground">Đang chơi</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <CheckCircle className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedGames}</p>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
              </div>
            </div>

            <div className="glass flex items-center gap-4 rounded-xl p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <Trophy className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">Rating TB</p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass overflow-hidden rounded-xl">
            <div className="border-b border-border bg-secondary/50 px-6 py-4">
              <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-sm">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                      Ván đấu
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                      W/L/D
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                      Tham gia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {profile.display_name || profile.username}
                            </p>
                            {profile.username && (
                              <p className="text-xs text-muted-foreground">
                                @{profile.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-bold",
                            profile.rating >= 1500
                              ? "bg-success/10 text-success"
                              : profile.rating >= 1200
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {profile.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {profile.games_played}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-success">{profile.games_won}</span>
                        {" / "}
                        <span className="text-destructive">
                          {profile.games_lost}
                        </span>
                        {" / "}
                        <span className="text-muted-foreground">
                          {profile.games_drawn}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {profile.is_admin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                        {formatDate(profile.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {profiles.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Chưa có người dùng nào
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
