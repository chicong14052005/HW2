import Link from "next/link";
import { Crown, AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="glass relative w-full max-w-md rounded-xl p-8 text-center">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Crown className="h-10 w-10 text-primary" />
            <span className="gradient-text text-3xl font-bold">
              Chess Master
            </span>
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">Đã xảy ra lỗi</h1>
        <p className="mb-6 text-muted-foreground">
          Không thể xác thực tài khoản của bạn. Liên kết có thể đã hết hạn hoặc
          không hợp lệ. Vui lòng thử đăng nhập lại hoặc yêu cầu liên kết mới.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="btn-glow inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold transition-all hover:bg-secondary"
          >
            Đăng ký mới
          </Link>
        </div>
      </div>
    </div>
  );
}
