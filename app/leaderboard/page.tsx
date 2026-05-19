import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Medal, Award, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils/chess";

async function getLeaderboard() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(100);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data || [];
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3)
      return <Award className="h-6 w-6 text-amber-600" />;
    return (
      <span className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">
        {rank}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">
              <span className="gradient-text">Bảng Xếp Hạng</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Top người chơi có rating cao nhất
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                Chưa có dữ liệu xếp hạng
              </h2>
              <p className="mt-2 text-muted-foreground">
                Hãy là người đầu tiên chơi và ghi danh trên bảng xếp hạng!
              </p>
            </div>
          ) : (
            <div className="glass overflow-hidden rounded-xl">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Người chơi</div>
                <div className="col-span-2 text-center">Rating</div>
                <div className="col-span-2 text-center">Ván đấu</div>
                <div className="col-span-2 text-center">Thắng/Thua/Hòa</div>
                <div className="col-span-1 text-center">Win %</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border">
                {leaderboard.map((player, idx) => {
                  const rank = idx + 1;
                  const isTopThree = rank <= 3;

                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "grid grid-cols-12 items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/30",
                        isTopThree && "bg-primary/5"
                      )}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* Player */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.display_name || player.username || "Anonymous"}
                          </p>
                          {player.username && (
                            <p className="text-xs text-muted-foreground">
                              @{player.username}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="col-span-2 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
                            player.rating >= 1500
                              ? "bg-success/10 text-success"
                              : player.rating >= 1200
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {player.rating}
                        </span>
                      </div>

                      {/* Games */}
                      <div className="col-span-2 text-center text-muted-foreground">
                        {player.games_played}
                      </div>

                      {/* W/L/D */}
                      <div className="col-span-2 text-center">
                        <span className="text-success">{player.games_won}</span>
                        {" / "}
                        <span className="text-destructive">
                          {player.games_lost}
                        </span>
                        {" / "}
                        <span className="text-muted-foreground">
                          {player.games_drawn}
                        </span>
                      </div>

                      {/* Win Rate */}
                      <div className="col-span-1 text-center font-medium">
                        {player.win_rate}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
