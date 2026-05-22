"use client";

import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { firebaseStorage } from "@/lib/firebase/client";
import type { UploadedFileItem } from "@/types/admin";
import { slugId } from "@/utils/format";

export async function uploadManagedFile(
  file: File,
  onProgress: (progress: number) => void,
  id = slugId("file"),
): Promise<UploadedFileItem> {
  if (!firebaseStorage) {
    for (const progress of [12, 28, 46, 68, 84, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      onProgress(progress);
    }

    return {
      id,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      status: "done",
      progress: 100,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    };
  }

  const storageRef = ref(firebaseStorage, `admin-uploads/${id}-${file.name}`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({
          id,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          status: "done",
          progress: 100,
          uploadedAt: new Date().toISOString(),
          url,
        });
      },
    );
  });
}
