"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Avatar, Button } from "./ui";

const MAX_BYTES = 5 * 1024 * 1024;
const OUT_SIZE = 320;

/** Memotong gambar menjadi persegi di tengah lalu mengecilkannya ke 320×320 JPEG. */
function toSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = OUT_SIZE;
      canvas.height = OUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, sx, sy, side, side, 0, 0, OUT_SIZE, OUT_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

export function PhotoUpload({ name, value, onChange, size = 112 }: { name: string; value?: string; onChange: (dataUrl: string) => void; size?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Format harus JPG, PNG, atau WEBP.");
    if (file.size > MAX_BYTES) return setError("Ukuran foto maksimal 5 MB.");
    setBusy(true);
    try {
      onChange(await toSquareJpeg(file));
    } catch {
      setError("Foto tidak dapat dibaca. Coba file lain.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        className="group relative shrink-0 rounded-full ring-4 ring-sky-100 transition hover:ring-sky-300"
        aria-label="Ganti foto profil"
      >
        <Avatar name={name} size={size} src={value ?? ""} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-900/45 text-white opacity-0 transition group-hover:opacity-100">
          <Camera size={size / 4} />
        </span>
      </button>
      <div>
        <p className="text-sm font-semibold text-ink-800">Foto profil</p>
        <p className="text-xs text-ink-500">JPG, PNG, atau WEBP, maks. 5 MB. Dipotong persegi otomatis. Gunakan foto wajah yang jelas dan profesional.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" type="button" onClick={() => ref.current?.click()} disabled={busy}>
            <Upload size={14} /> {busy ? "Memproses…" : value ? "Ganti foto" : "Unggah foto"}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" type="button" onClick={() => onChange("")}>
              <Trash2 size={14} /> Hapus
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
