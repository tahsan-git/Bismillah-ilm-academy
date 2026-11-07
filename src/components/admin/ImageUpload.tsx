"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, X } from "lucide-react";

export function ImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("site-images").upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
      onChange(data.publicUrl);
    } catch (error: any) {
      alert("ছবি আপলোডে সমস্যা হয়েছে: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-ink mb-1">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="w-32 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition text-slate-500">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            <span className="text-xs mt-1">ছবি আপলোড</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
        {value && <span className="text-xs text-green-600 font-bold">✓ ছবি যুক্ত হয়েছে</span>}
      </div>
    </div>
  );
}