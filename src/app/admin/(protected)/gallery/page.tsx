import { GalleryManager } from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default function AdminGalleryPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-black mb-1">Previous Work Gallery</h1>
      <p className="text-sm text-medium-grey mb-8">Upload and manage the photos shown on the Previous Work page.</p>
      <GalleryManager />
    </div>
  );
}
