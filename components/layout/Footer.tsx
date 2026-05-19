import Link from "next/link";
import { Crown, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="font-semibold">Chess Master</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">
              Giới thiệu
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Chính sách
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Liên hệ
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-destructive" />
            <span>by</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-foreground hover:text-primary"
            >
              <Github className="h-4 w-4" />
              Chess Team
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            Powered by Alpha-Beta Pruning & Monte Carlo Tree Search algorithms
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Chess Master. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
