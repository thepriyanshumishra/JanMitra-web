import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadProgress {
    progress: number; // 0–100
    url?: string;
    error?: string;
}

/**
 * Upload a single file to Firebase Storage under evidence/{grievanceId}/{filename}
 * Returns a promise of the public download URL.
 */
export async function uploadEvidenceFile(
    grievanceId: string,
    file: File,
    onProgress?: (p: number) => void
): Promise<string> {
    if (!storage) throw new Error("Firebase Storage not initialized");

    const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageRef = ref(storage, `evidence/${grievanceId}/${safeFilename}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const pct = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                onProgress?.(pct);
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

/** Upload multiple files, return array of download URLs */
export async function uploadMultipleFiles(
    grievanceId: string,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
    const urls = await Promise.all(
        files.map((file, i) =>
            uploadEvidenceFile(grievanceId, file, (p) => onProgress?.(i, p))
        )
    );
    return urls;
}
