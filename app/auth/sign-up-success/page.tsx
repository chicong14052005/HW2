import Link from "next/link";
import { Crown, Mail, CheckCircle } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-success/5 blur-3xl" />
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
          <div className="rounded-full bg-success/10 p-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">Đăng ký thành công!</h1>
        <p className="mb-6 text-muted-foreground">
          Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn. Vui lòng
          kiểm tra hộp thư và nhấp vào liên kết để kích hoạt tài khoản.
        </p>

        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-info/10 p-4 text-info">
          <Mail className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">Kiểm tra cả thư mục Spam nếu không thấy email</p>
        </div>

        <Link
          href="/auth/login"
          className="btn-glow inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
