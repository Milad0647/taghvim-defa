"use client";

import { IranEmblem } from "@/components/brand/IranEmblem";
import { getSiteBranding, SITE_TAGLINE, SITE_TITLE } from "@/lib/branding";
import { canViewAdminViews, loginRequest } from "@/lib/auth";
import { getSession } from "@/lib/admin-store";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";

type Pointer = { x: number; y: number };

const CENTER: Pointer = { x: 0.5, y: 0.5 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function LoginPage() {
  const router = useRouter();
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef<Pointer>(CENTER);
  const smoothRef = useRef<Pointer>({ ...CENTER });
  const [pointer, setPointer] = useState<Pointer>(CENTER);
  const [isHovering, setIsHovering] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    siteTitle: SITE_TITLE,
    siteTagline: SITE_TAGLINE,
  });

  const tick = useCallback(() => {
    const target = targetRef.current;
    const smooth = smoothRef.current;

    smooth.x = lerp(smooth.x, target.x, 0.1);
    smooth.y = lerp(smooth.y, target.y, 0.1);

    setPointer({ x: smooth.x, y: smooth.y });
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    applyTheme("dark");
    return () => {
      applyTheme(getStoredTheme());
    };
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [tick]);

  useEffect(() => {
    const b = getSiteBranding();
    setBranding({ siteTitle: b.siteTitle, siteTagline: b.siteTagline });
    const session = getSession();
    if (session) {
      router.replace(
        canViewAdminViews(session.user) ? "/timeline" : "/my-content",
      );
    }
  }, [router]);

  function handlePointerMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
    setIsHovering(true);
  }

  function handlePointerLeave() {
    targetRef.current = CENTER;
    setIsHovering(false);
  }

  const tiltX = (pointer.y - 0.5) * -10;
  const tiltY = (pointer.x - 0.5) * 10;
  const bgShiftX = (pointer.x - 0.5) * 28;
  const bgShiftY = (pointer.y - 0.5) * 28;
  const glareX = pointer.x * 100;
  const glareY = pointer.y * 100;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginRequest(username, password);
      router.replace(
        canViewAdminViews(session.user) ? "/timeline" : "/my-content",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ direction: "rtl" }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div
        aria-hidden
        className="absolute inset-[-8%] bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: "url(/login-bg.webp)",
          filter: "blur(5px) saturate(1.15)",
          transform: `translate3d(${bgShiftX}px, ${bgShiftY}px, 0) scale(1.08)`,
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.22)_100%)]"
      />

      <div
        className="relative w-full max-w-[460px]"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: isHovering
            ? "transform 0.08s ease-out"
            : "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="relative overflow-hidden rounded-[32px] border border-white/35 bg-white/[0.07] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-[28px] backdrop-saturate-150">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px]"
            style={{
              background: `radial-gradient(520px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.08) 28%, transparent 58%)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10"
          />

          <div className="relative mb-8 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl">
              <IranEmblem className="h-8 w-8 text-white/95 drop-shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white/55">ورود به سامانه</p>
              <h1 className="mt-1 text-[1.2rem] font-semibold leading-8 tracking-tight text-white drop-shadow-sm">
                {branding.siteTitle}
              </h1>
              <p className="mt-1 text-sm leading-7 text-white/75">
                {branding.siteTagline}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="relative space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-white/80">نام کاربری</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                placeholder="نام کاربری خود را وارد کنید"
                className="w-full rounded-2xl border border-white/25 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none backdrop-blur-xl transition focus:border-white/45 focus:bg-white/[0.1] focus:ring-2 focus:ring-white/20"
                required
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-white/80">رمز عبور</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="رمز عبور"
                className="w-full rounded-2xl border border-white/25 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] outline-none backdrop-blur-xl transition focus:border-white/45 focus:bg-white/[0.1] focus:ring-2 focus:ring-white/20"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200/25 bg-red-500/15 px-4 py-2.5 text-sm text-red-50 backdrop-blur-xl">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-white/20 bg-[#0A84FF]/90 py-3.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(10,132,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md transition hover:bg-[#0077ED] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/50 drop-shadow">
          سامانه مدیریت تقویم دفاعی
        </p>
      </div>
    </main>
  );
}
