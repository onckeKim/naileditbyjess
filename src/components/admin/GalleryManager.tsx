"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";

type Image = { id: string; imageUrl: string; caption: string; active: boolean; sortOrder: number };

export function GalleryManager() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setImages(data.images || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url, caption }),
      });
      setCaption("");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(img: Image) {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !img.active }),
    });
    load();
  }

  async function updateCaption(img: Image, newCaption: string) {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: newCaption }),
    });
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setImages(reordered);
    await Promise.all(
      reordered.map((img, i) =>
        fetch(`/api/admin/gallery/${img.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    );
  }

  return (
    <div>
      <Card className="p-5 mb-6">
        <h2 className="font-display text-lg font-semibold text-black mb-3">Add a Photo</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="flex-1 border border-marble rounded-sm px-3 py-2 text-sm" />
          <label className="inline-flex items-center justify-center border border-black bg-black text-white rounded-sm px-4 py-2 text-sm cursor-pointer whitespace-nowrap">
            {uploading ? "Uploading…" : "Upload Photo"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-medium-grey">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <Card key={img.id} className={`overflow-hidden ${!img.active ? "opacity-60" : ""}`}>
              {img.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.imageUrl} alt={img.caption} className="w-full aspect-square object-cover" />
              ) : (
                <PlaceholderArt className="w-full aspect-square" />
              )}
              <div className="p-3">
                <input
                  defaultValue={img.caption}
                  onBlur={(e) => updateCaption(img, e.target.value)}
                  className="w-full text-sm border-b border-transparent focus:border-marble outline-none mb-2"
                  placeholder="Caption"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button disabled={i === 0} onClick={() => move(i, -1)} className="text-medium-grey disabled:opacity-30 text-xs px-1">
                      ▲
                    </button>
                    <button disabled={i === images.length - 1} onClick={() => move(i, 1)} className="text-medium-grey disabled:opacity-30 text-xs px-1">
                      ▼
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {!img.active && <Badge tone="neutral">Hidden</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(img)}>
                      {img.active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(img.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
