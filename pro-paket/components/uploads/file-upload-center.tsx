"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileArchive, FileImage, FileText, UploadCloud, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadManagedFile } from "@/services/storage-service";
import { useAdminStore } from "@/store/admin-store";
import type { UploadedFileItem } from "@/types/admin";
import { formatBytes, relativeTime, slugId } from "@/utils/format";

const acceptedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <FileImage className="h-5 w-5 text-cyan-200" />;
  if (type.includes("pdf") || type.includes("word")) {
    return <FileText className="h-5 w-5 text-violet-200" />;
  }
  return <FileArchive className="h-5 w-5 text-slate-300" />;
}

function validate(file: File) {
  if (!acceptedTypes.includes(file.type)) {
    return "Sadece görsel, PDF ve DOC/DOCX dosyaları kabul edilir.";
  }
  if (file.size > 12 * 1024 * 1024) {
    return "Dosya boyutu 12 MB üzerinde olamaz.";
  }
  return null;
}

export function FileUploadCenter() {
  const uploads = useAdminStore((state) => state.uploads);
  const addUpload = useAdminStore((state) => state.addUpload);
  const updateUpload = useAdminStore((state) => state.updateUpload);
  const addToast = useAdminStore((state) => state.addToast);
  const pushActivity = useAdminStore((state) => state.pushActivity);
  const currentUser = useAdminStore((state) => state.currentUser);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  async function processFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    for (const file of files) {
      const error = validate(file);
      if (error) {
        addToast({ title: "Dosya reddedildi", message: `${file.name}: ${error}`, variant: "error" });
        continue;
      }

      const id = slugId("file");
      const placeholder: UploadedFileItem = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };
      addUpload(placeholder);

      try {
        const result = await uploadManagedFile(
          file,
          (progress) => updateUpload(id, { progress, status: "uploading" }),
          id,
        );
        updateUpload(id, result);
        pushActivity({
          actor: currentUser?.name || "Admin",
          actorRole: currentUser?.role || "editor",
          action: "Dosya yükledi",
          target: file.name,
          level: "info",
          ip: "local",
        });
        addToast({
          title: "Yükleme tamam",
          message: `${file.name} başarıyla yüklendi.`,
          variant: "success",
        });
      } catch (uploadError) {
        updateUpload(id, { status: "error", progress: 100 });
        addToast({
          title: "Yükleme başarısız",
          message: uploadError instanceof Error ? uploadError.message : file.name,
          variant: "error",
        });
      }
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void processFiles(event.dataTransfer.files);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void processFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="grid gap-4">
      <Card
        className={`grid min-h-[260px] place-items-center border-dashed p-6 text-center transition ${
          dragging ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/15"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="max-w-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10">
            <UploadCloud className="h-8 w-8 text-cyan-100" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Drag & drop dosya yükleme</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Görsel, PDF ve DOC/DOCX dosyaları çoklu seçilebilir. Firebase Storage env varsa
            gerçek storage alanına, yoksa demo oturuma yüklenir.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => inputRef.current?.click()}>
              Dosya seç
            </Button>
            <Badge tone="blue">Progress bar</Badge>
            <Badge tone="violet">Çoklu yükleme</Badge>
            <Badge tone="green">Storage bağlantısı</Badge>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
            onChange={handleInput}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white">Yüklenen dosyalar</h3>
          <p className="mt-1 text-sm text-slate-400">Dosya durumu, boyutu ve yükleme ilerlemesi</p>
        </div>
        <div className="grid divide-y divide-white/5">
          {uploads.map((upload) => (
            <div key={upload.id} className="grid gap-3 p-4 md:grid-cols-[1fr_220px] md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                  <FileIcon type={upload.type} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-white">{upload.name}</p>
                    <Badge tone={upload.status === "done" ? "green" : upload.status === "error" ? "rose" : "amber"}>
                      {upload.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(upload.size)} / {relativeTime(upload.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{upload.progress}%</span>
                  {upload.status === "error" ? (
                    <span className="inline-flex items-center gap-1 text-rose-200">
                      <XCircle className="h-3 w-3" />
                      Hata
                    </span>
                  ) : upload.url ? (
                    <a className="text-cyan-200 hover:text-white" href={upload.url} target="_blank">
                      Aç
                    </a>
                  ) : (
                    <span>İşleniyor</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {uploads.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-slate-500">
              Henüz dosya yüklenmedi.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export default FileUploadCenter;
