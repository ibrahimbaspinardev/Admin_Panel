"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { loginWithEmail, loginWithGoogle, resetPassword } from "@/services/auth-service";
import { useAdminStore } from "@/store/admin-store";

export function LoginPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
  const signIn = useAdminStore((state) => state.signIn);
  const addToast = useAdminStore((state) => state.addToast);
  const [email, setEmail] = useState("admin@propanel.dev");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "reset" | null>(null);

  const subtitle = useMemo(
    () =>
      isFirebaseConfigured
        ? "Firebase Auth ve güvenli session cookie ile giriş yapın."
        : "Firebase env yok. Demo giriş aynı panel akışlarını yerel verilerle çalıştırır.",
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("email");
    try {
      const profile = await loginWithEmail({ email, password, remember });
      signIn(profile);
      addToast({
        title: "Oturum açıldı",
        message: `${profile.name} olarak panele giriş yapıldı.`,
        variant: "success",
      });
      onAuthenticated();
    } catch (error) {
      addToast({
        title: "Giriş başarısız",
        message: error instanceof Error ? error.message : "Bilgileri kontrol edin.",
        variant: "error",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setLoading("google");
    try {
      const profile = await loginWithGoogle();
      signIn(profile);
      addToast({
        title: "Google girişi tamam",
        message: `${profile.email} hesabı ile oturum açıldı.`,
        variant: "success",
      });
      onAuthenticated();
    } catch (error) {
      addToast({
        title: "Google girişi başarısız",
        message: error instanceof Error ? error.message : "Popup kapatıldı veya yetki alınamadı.",
        variant: "error",
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      addToast({
        title: "E-posta gerekli",
        message: "Şifre sıfırlama bağlantısı için e-posta yazın.",
        variant: "warning",
      });
      return;
    }

    setLoading("reset");
    try {
      await resetPassword(email);
      addToast({
        title: "Sıfırlama gönderildi",
        message: "Şifre sıfırlama bağlantısı e-posta adresine gönderildi.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Sıfırlama başarısız",
        message: error instanceof Error ? error.message : "Firebase isteği tamamlanamadı.",
        variant: "error",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#070a12] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_28%),linear-gradient(135deg,#070a12,#0d1324_52%,#090b10)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_460px] lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden lg:block"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-cyan-200" />
            Production-ready SaaS admin sistemi
          </div>
          <h1 className="max-w-3xl text-6xl font-semibold leading-[1.02] tracking-normal text-white">
            Operasyon, güvenlik ve gelir akışı tek panelde.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Rol bazlı erişim, canlı Firestore verisi, gelişmiş tablo yönetimi,
            dosya yükleme, audit log ve tema sistemi hazır.
          </p>
          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-3">
            {[
              ["99.99%", "Sistem uptime"],
              ["28.4K", "Günlük aktif"],
              ["4 rol", "Yetki modeli"],
            ].map(([value, label]) => (
              <Card key={label} className="p-5">
                <div className="text-3xl font-semibold text-white">{value}</div>
                <div className="mt-2 text-sm text-slate-400">{label}</div>
              </Card>
            ))}
          </div>
        </motion.section>

        <Card className="relative p-5 sm:p-7">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200/30 bg-cyan-300/15">
                <Fingerprint className="h-6 w-6 text-cyan-100" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Pro Paket</p>
                <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
              </div>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              Güvenli
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white">Yönetici girişi</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm text-slate-300">
              E-posta
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="pl-10"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Şifre
              <span className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  className="pl-10 pr-11"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-300"
                />
                Beni hatırla
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-cyan-200 transition hover:text-white"
                disabled={loading === "reset"}
              >
                {loading === "reset" ? "Gönderiliyor..." : "Şifremi unuttum"}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading !== null}>
              {loading === "email" ? "Giriş yapılıyor..." : "Giriş yap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            veya
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <Button className="w-full" size="lg" onClick={handleGoogle} disabled={loading !== null}>
            <KeyRound className="h-4 w-4" />
            {loading === "google" ? "Google bağlanıyor..." : "Google ile giriş"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
