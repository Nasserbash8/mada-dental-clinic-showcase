'use client';
/**
 * UserImages (doctor view, abridged sample)
 * Clinical photo / X-ray gallery with a lightbox, optimistic deletion and multi-file upload.
 */
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FileUpload from 'react-material-file-upload';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Modal from '../modal';
import Button from '../button/Button';

type Image = { _id: string; src: string; date: string | Date };

export default function UserImages({ patient }: { patient: { patientId: string; images: Image[] } }) {
  const [images, setImages] = useState<Image[]>(patient.images || []);
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewer, setViewer] = useState(-1); // index of the image shown in the lightbox, -1 = closed

  const endpoint = `/api/patients/${patient.patientId}`;

  /** Optimistic delete: remove from the UI first, then tell the server (restore on failure). */
  async function remove(id: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    const backup = images;
    setImages((prev) => prev.filter((i) => i._id !== id));

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleteImageIds: [id] }),
    }).catch(() => null);

    if (!res?.ok) {
      setImages(backup);
      alert('Failed to delete image. Please try again.');
    }
  }

  /** Upload as multipart so files travel as binary instead of base64 JSON. */
  async function upload() {
    if (saving || !files.length) return;
    setSaving(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('newImages', f));
      const data = await (await fetch(endpoint, { method: 'PATCH', body: form })).json();
      if (!data.success) throw new Error(data.message);
      setImages(data.data.images || []);
      setFiles([]);
      setOpen(false);
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border p-5 lg:p-6">
      <h2 className="text-lg font-semibold mb-4">Patient Gallery</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={img._id} className="relative group">
            <img src={img.src} alt={`Record ${i + 1}`} onClick={() => setViewer(i)} className="w-full h-40 object-cover rounded-md cursor-pointer" />
            <button onClick={() => remove(img._id)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hidden group-hover:block">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Lightbox
        open={viewer >= 0}
        index={viewer}
        close={() => setViewer(-1)}
        slides={images.map((i) => ({ src: i.src }))}
        carousel={{ finite: true }}
      />

      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 mt-6 text-white bg-brand-600 rounded-lg">
        <Plus className="w-4 h-4" /> Add New Photos
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} isFullscreen>
        <div className="p-6">
          <h4 className="text-xl font-semibold mb-6">Manage Patient Photos</h4>
          <FileUpload value={files} onChange={setFiles} multiple accept="image/*" title="Drag and drop images here or click to browse" />
          <div className="flex justify-end mt-8 gap-3">
            <Button variant="outline" onClick={() => { setOpen(false); setFiles([]); }}>Cancel</Button>
            <Button onClick={upload} disabled={saving || !files.length}>{saving ? 'Saving...' : 'Upload Photos'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
