import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  Crown,
  Bot,
  Users,
  Trophy,
  Zap,
  Brain,
  ArrowRight,
  Play,
  Shield,
  Clock,
  Target,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bot,
    title: "AI Thông Minh",
    description:
      "Đối đầu với AI sử dụng thuật toán Alpha-Beta Pruning và Monte Carlo Tree Search tiên tiến",
  },
  {
    icon: Users,
    title: "Đa Chế Độ",
    description:
      "Chơi PvP với bạn bè, đấu với AI, hoặc xem AI vs AI để học chiến thuật",
  },
  {
    icon: Trophy,
    title: "Bảng Xếp Hạng",
    description:
      "Cạnh tranh với người chơi khác, leo hạng và trở thành kiện tướng",
  },
  {
    icon: Brain,
    title: "Phân Tích Nước Đi",
    description:
      "Theo dõi lịch sử nước đi, thời gian suy nghĩ của AI và phân tích chiến thuật",
  },
  {
    icon: Shield,
    title: "Tài Khoản Bảo Mật",
    description:
      "Đăng ký và đăng nhập an toàn, lưu trữ tiến trình và thống kê cá nhân",
  },
  {
    icon: Clock,
    title: "Lịch Sử Ván Đấu",
    description:
      "Xem lại các ván đấu đã chơi, học hỏi từ những sai lầm và cải thiện kỹ năng",
  },
];

const GAME_MODES = [
  {
    mode: "pvai",
    icon: Bot,
    title: "Người vs AI",
    description: "Thử thách bản thân với AI",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    mode: "pvp",
    icon: Users,
    title: "Người vs Người",
    description: "Chơi với bạn bè",
    color: "from-success/20 to-success/5",
    borderColor: "border-success/30",
  },
  {
    mode: "aivai",
    icon: Zap,
    title: "AI vs AI",
    description: "Xem AI đối đầu",
    color: "from-info/20 to-info/5",
    borderColor: "border-info/30",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Crown className="h-4 w-4" />
              <span>Trải nghiệm cờ vua đỉnh cao</span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="gradient-text">Chess Master</span>
              <br />
              <span className="text-foreground">Chinh Phục AI</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Thử thách bản thân với các thuật toán AI tiên tiến như Alpha-Beta
              Pruning và Monte Carlo Tree Search. Theo dõi tiến trình, cạnh
              tranh trên bảng xếp hạng!
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/play"
                className="btn-glow group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Play className="h-5 w-5" />
                Chơi Ngay
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/leaderboard"
                className="flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-semibold transition-all hover:bg-secondary"
              >
                <Trophy className="h-5 w-5 text-primary" />
                Bảng Xếp Hạng
              </Link>
            </div>
          </div>
        </section>

        {/* Game Modes Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Chế Độ Chơi</h2>
              <p className="mt-4 text-muted-foreground">
                Chọn chế độ phù hợp với bạn
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {GAME_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Link
                    key={mode.mode}
                    href={`/play?mode=${mode.mode}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 transition-all hover:scale-[1.02] hover:shadow-xl ${mode.color} ${mode.borderColor}`}
                  >
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex rounded-xl bg-background/80 p-3">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{mode.title}</h3>
                      <p className="text-muted-foreground">{mode.description}</p>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-border bg-card/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Tính Năng Nổi Bật</h2>
              <p className="mt-4 text-muted-foreground">
                Mọi thứ bạn cần cho hành trình chinh phục cờ vua
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI Algorithms Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Thuật Toán AI
                  <br />
                  <span className="gradient-text">Tiên Tiến</span>
                </h2>
                <p className="mt-6 text-muted-foreground">
                  Chess Master sử dụng hai thuật toán AI hàng đầu trong lĩnh vực
                  game:
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Alpha-Beta Pruning</h3>
                      <p className="text-sm text-muted-foreground">
                        Thuật toán minimax được tối ưu, cắt tỉa các nhánh không
                        cần thiết để tìm nước đi tốt nhất nhanh hơn.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Monte Carlo Tree Search</h3>
                      <p className="text-sm text-muted-foreground">
                        Thuật toán mô phỏng hàng nghìn ván đấu để đánh giá nước
                        đi, được sử dụng trong AlphaGo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 p-8">
                  <div className="flex h-full items-center justify-center">
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 w-12 rounded-lg transition-colors ${
                            (Math.floor(i / 4) + (i % 4)) % 2 === 0
                              ? "bg-board-light"
                              : "bg-board-dark"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-card/50 to-background py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Sẵn Sàng Thử Thách?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Đăng ký miễn phí và bắt đầu hành trình chinh phục cờ vua ngay hôm
              nay. Theo dõi tiến trình, cạnh tranh với người chơi khác!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Đăng Ký Miễn Phí
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/play"
                className="flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-semibold transition-all hover:bg-secondary"
              >
                Chơi Không Cần Đăng Ký
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
