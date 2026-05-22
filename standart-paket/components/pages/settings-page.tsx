"use client";

import { Save, ShieldCheck, SlidersHorizontal, SunMoon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField, SelectField } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { usePanelUI } from "@/components/providers/panel-ui-provider";

export function SettingsPage() {
  const { firebaseEnabled, user } = useAuth();
  const { theme, setTheme, showToast } = usePanelUI();
  const [profile, setProfile] = useState({
    name: "Standart Paket Admin",
    email: "admin@standartpaket.com",
    company: "Örnek İşletme",
  });
  const [settings, setSettings] = useState({
    realtime: true,
    stockWarning: true,
    orderMail: false,
    deliveryDay: "4",
  });

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast({
      tone: "success",
      title: "Profil kaydedildi",
      description: "Profil ayarları güncellendi.",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Panel yapılandırması"
        title="Ayarlar"
        description="Profil, tema, Firebase ve sistem ayarlarını yönetin."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Profil ayarları
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Yönetici profil bilgileri.
              </p>
            </div>
          </div>
          <form onSubmit={handleProfile} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Ad
              </span>
              <TextField
                value={profile.name}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                E-posta
              </span>
              <TextField
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                İşletme adı
              </span>
              <TextField
                value={profile.company}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, company: event.target.value }))
                }
              />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <Button icon={Save} type="submit">
                Profili kaydet
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <SunMoon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Tema ayarları
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Panel görünümünü değiştirin.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-lg border p-4 text-left transition ${
                theme === "light"
                  ? "border-teal-400 bg-teal-50 dark:bg-teal-500/10"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              }`}
              aria-pressed={theme === "light"}
            >
              <p className="font-bold text-slate-950 dark:text-white">Aydınlık</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Açık arka plan ve net kontrast.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-lg border p-4 text-left transition ${
                theme === "dark"
                  ? "border-teal-400 bg-teal-50 dark:bg-teal-500/10"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              }`}
              aria-pressed={theme === "dark"}
            >
              <p className="font-bold text-slate-950 dark:text-white">Koyu</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gece kullanımı için düşük parlaklık.
              </p>
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Sistem ayarları
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Standart paket teslim ve bildirim seçenekleri.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              ["realtime", "Gerçek zamanlı veri", "Firestore onSnapshot abonelikleri aktif."],
              ["stockWarning", "Stok uyarısı", "Kritik stok seviyelerinde bildirim üret."],
              ["orderMail", "Sipariş e-postası", "Yeni siparişlerde yöneticiye e-posta gönder."],
            ].map(([key, title, description]) => (
              <label
                key={key}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <span>
                  <span className="block font-bold text-slate-950 dark:text-white">{title}</span>
                  <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={settings[key as keyof typeof settings] === true}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  className="mt-1 h-5 w-5 accent-teal-500"
                />
              </label>
            ))}
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Teslim süresi
              </span>
              <SelectField
                value={settings.deliveryDay}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, deliveryDay: event.target.value }))
                }
              >
                <option value="4">4 gün teslim</option>
                <option value="3">3 gün hızlandırılmış</option>
                <option value="5">5 gün planlı teslim</option>
              </SelectField>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Firebase bağlantısı
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Panel Firebase Authentication ve Firestore için hazır. Env değerleri
            tanımlandığında route koruması, anonim demo giriş ve gerçek zamanlı
            koleksiyon abonelikleri devreye girer.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-bold uppercase text-slate-400">Durum</p>
              <div className="mt-3">
                <Badge tone={firebaseEnabled ? "emerald" : "amber"}>
                  {firebaseEnabled ? "Firebase bağlı" : "Demo veri aktif"}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs font-bold uppercase text-slate-400">Oturum</p>
              <p className="mt-3 font-semibold text-slate-950 dark:text-white">
                {user?.uid ?? "Yerel demo"}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Gerekli env alanları
            </p>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:grid-cols-2">
              <span>NEXT_PUBLIC_FIREBASE_API_KEY</span>
              <span>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</span>
              <span>NEXT_PUBLIC_FIREBASE_PROJECT_ID</span>
              <span>NEXT_PUBLIC_FIREBASE_APP_ID</span>
              <span>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</span>
              <span>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
