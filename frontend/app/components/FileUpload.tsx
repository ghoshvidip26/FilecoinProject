"use client";

import { useRef, useState } from "react";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
  file: File | null;
  disabled?: boolean;
};

export default function FileUpload({
  onFileSelect,
  file,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files?.length) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`group relative w-full border-2 border-dashed rounded-2xl p-8 transition-all duration-300 
        ${
          isDragging
            ? "border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.01]"
            : "border-gray-600 hover:border-gray-400 hover:border-opacity-50 bg-gray-800/50 hover:bg-gray-800/70"
        } 
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-[1.01] hover:shadow-lg"
        }
        backdrop-blur-sm`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        {file ? (
          <div className="relative w-full max-w-sm mx-auto">
            <div className="w-full aspect-square relative overflow-hidden rounded-lg mb-3">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-sm text-gray-400 truncate">{file.name}</p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gradient-to-b from-blue-600/20 to-blue-600/10 rounded-2xl group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-blue-100 transition-colors duration-300">
              Drag and drop your MRI scan
            </h3>
            <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300 transition-colors duration-300">
              or click to browse (JPEG, PNG, DICOM)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
