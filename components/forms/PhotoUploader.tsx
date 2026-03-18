'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

interface PhotoUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  uploadUrl?: string;
  maxFiles?: number;
}

export function PhotoUploader({
  value = [],
  onChange,
  uploadUrl = '/api/v1/uploads/photos',
  maxFiles = MAX_FILES,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<{ url: string; name: string }[]>(
    value.map((url, i) => ({ url, name: url.split('/').pop() || `photo-${i}` }))
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const validFiles: File[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Only JPEG and PNG files are allowed.');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File must be smaller than 5MB.');
        continue;
      }
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} photos allowed.`);
        break;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const newFiles = [...files];

    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('photos', file);
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        newFiles.push({ url: data.url, name: file.name });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setFiles(newFiles);
    onChange?.(newFiles.map((f) => f.url));
    setUploading(false);
  }, [files, maxFiles, onChange, uploadUrl]);

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onChange?.(next.map((f) => f.url));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300',
          uploading && 'opacity-60 pointer-events-none',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={32} className="mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-medium text-slate-600">Click or drag photos to upload</p>
        <p className="text-xs text-slate-400 mt-1">
          JPEG/PNG only, max 5MB each, up to {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {files.map((file, i) => (
            <div key={i} className="relative group rounded-lg border border-slate-200 overflow-hidden aspect-square bg-slate-50">
              {file.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={24} className="text-slate-300" />
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
