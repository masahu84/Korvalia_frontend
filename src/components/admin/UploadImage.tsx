import { useState, type ChangeEvent } from 'react';

interface UploadImageProps {
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function UploadImage({ multiple = false, onFilesChange, maxFiles = 20 }: UploadImageProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    setFiles(selectedFiles);
    onFilesChange(selectedFiles);

    // Crear previews
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);

    // Liberar URL del preview
    URL.revokeObjectURL(previews[index]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          id="file-upload"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <div>
            <p className="text-sm font-medium text-gray-900">
              Haz clic para subir {multiple ? 'imágenes' : 'una imagen'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP hasta 5MB {multiple && `(máximo ${maxFiles} archivos)`}
            </p>
          </div>
        </label>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* File Info */}
              <p className="text-xs text-gray-600 mt-1 truncate">{files[index]?.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {previews.length > 0 && (
        <p className="text-sm text-gray-600">
          {previews.length} {previews.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
        </p>
      )}
    </div>
  );
}
