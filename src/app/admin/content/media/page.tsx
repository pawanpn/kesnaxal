"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { supabase } from "@/lib/supabase/client";

interface MediaItem {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string | null;
  size_bytes: number | null;
  section: string | null;
  content_key: string | null;
  created_at: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const fetchMedia = async () => {
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    setMedia((data as MediaItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `library/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("media").upload(fileName, file);
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(data.path);
      await supabase.from("media").insert({
        file_name: file.name,
        storage_path: data.path,
        public_url: publicUrl,
        section: "library",
        mime_type: file.type,
        size_bytes: file.size,
      });
      await fetchMedia();
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file permanently?")) return;
    const item = media.find((m) => m.id === id);
    if (item) {
      await supabase.storage.from("media").remove([item.file_name]);
    }
    await supabase.from("media").delete().eq("id", id);
    await fetchMedia();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copied!");
  };

  return (
    <AdminGuard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Media Library</h1>
            <p className="text-xs text-muted mt-1">{media.length} files in storage</p>
          </div>
          <label className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark cursor-pointer transition-colors">
            {uploading ? "Uploading..." : "Upload File"}
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" />
          </label>
        </div>

        {loading ? (
          <p className="text-xs text-muted">Loading...</p>
        ) : media.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-sm text-muted">No files uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {media.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-border overflow-hidden group">
                {/* Preview */}
                <div className="aspect-square bg-surface flex items-center justify-center overflow-hidden">
                  {item.mime_type?.startsWith("image/") ? (
                    <img src={item.public_url} alt={item.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                      <svg className="w-8 h-8 mx-auto text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[10px] text-muted mt-1 truncate">{item.file_name}</p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <p className="text-[10px] font-medium text-foreground truncate">{item.file_name}</p>
                  <p className="text-[10px] text-muted">
                    {item.size_bytes ? `${(item.size_bytes / 1024).toFixed(1)} KB` : ""}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    <button
                      onClick={() => copyToClipboard(item.public_url)}
                      className="flex-1 py-1 rounded text-[10px] font-semibold bg-surface hover:bg-primary hover:text-white transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="py-1 px-2 rounded text-[10px] font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
