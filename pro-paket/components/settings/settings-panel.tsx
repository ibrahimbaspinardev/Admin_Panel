"use client";

import { FormEvent, useState } from "react";
import { Globe2, LockKeyhole, Palette, Save, ShieldCheck, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/store/admin-store";
import type { LanguageCode, ThemeMode } from "@/types/admin";
import { accentPalettes } from "@/styles/design-tokens";

export function SettingsPanel() {
  const currentUser = useAdminStore((state) => state.currentUser);
  const updateCurrentUser = useAdminStore((state) => state.updateCurrentUser);
  const theme = useAdminStore((state) => state.theme);
  const setTheme = useAdminStore((state) => state.setTheme);
  const language = useAdminStore((state) => state.language);
  const setLanguage = useAdminStore((state) => state.setLanguage);
  const addToast = useAdminStore((state) => state.addToast);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [mfa, setMfa] = useState(true);
  const [rateLimit, setRateLimit] = useState(true);
  const [auditRetention, setAuditRetention] = useState(true);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateCurrentUser({ name, email });
    addToast({
      title: "Profil güncellendi",
      message: "Profil bilgileri oturum durumuna kaydedildi.",
      variant: "success",
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
      <div className="grid gap-4">
        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <UserCog className="h-5 w-5 text-cyan-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Profil ayarları</h2>
              <p className="mt-1 text-sm text-slate-400">Yönetici kimliği ve görünür profil verisi</p>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={saveProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                Ad soyad
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                E-posta
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                <Save className="h-4 w-4" />
                Kaydet
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <Palette className="h-5 w-5 text-violet-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Tema ve görünüm</h2>
              <p className="mt-1 text-sm text-slate-400">Dark, light ve sistem teması</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["dark", "light", "system"] as ThemeMode[]).map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                className={`rounded-lg border p-4 text-left transition ${
                  theme === option
                    ? "border-cyan-300/60 bg-cyan-300/12"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                }`}
              >
                <p className="font-medium text-white">{option}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {option === "system" ? "Cihaz ayarını takip eder" : `${option} tema`}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {accentPalettes.map((palette) => (
              <div key={palette.name} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-3 flex gap-2">
                  <span className="h-7 w-7 rounded-full" style={{ background: palette.primary }} />
                  <span className="h-7 w-7 rounded-full" style={{ background: palette.secondary }} />
                </div>
                <p className="text-sm font-medium text-white">{palette.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <Globe2 className="h-5 w-5 text-cyan-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Dil</h2>
              <p className="mt-1 text-sm text-slate-400">Panel dil tercihi</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["tr", "en"] as LanguageCode[]).map((option) => (
              <Button
                key={option}
                variant={language === option ? "primary" : "secondary"}
                onClick={() => setLanguage(option)}
              >
                {option === "tr" ? "Türkçe" : "English"}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-violet-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Güvenlik ayarları</h2>
              <p className="mt-1 text-sm text-slate-400">Oturum ve erişim politikaları</p>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ["Çok faktörlü doğrulama", mfa, setMfa],
              ["Rate limit koruması", rateLimit, setRateLimit],
              ["Audit log saklama", auditRetention, setAuditRetention],
            ].map(([label, checked, setter]) => (
              <label
                key={label as string}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
              >
                <span className="text-sm text-slate-200">{label as string}</span>
                <input
                  type="checkbox"
                  checked={checked as boolean}
                  onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 accent-cyan-300"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
            <h2 className="text-lg font-semibold text-white">Sistem ayarları</h2>
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-200">Protected routes</span>
                <Badge tone="green">Aktif</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Next 16 `proxy.ts` session cookie kontrolü ile `/dashboard` rotasını korur.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-200">Firestore Rules</span>
                <Badge tone="blue">Hazır</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                `firebase/firestore.rules` rol bazlı erişim şemasını içerir.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPanel;
