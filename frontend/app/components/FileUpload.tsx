"use client";

import { useState } from "react";
import Image from "next/image";

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
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
      className={`w-full border-2 border-dashed rounded-xl p-6 transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() =>
        !disabled && document.getElementById("file-upload")?.click()
      }
    >
      <input
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
            <p className="text-sm text-gray-400">{file.name}</p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-blue-600/20 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">
              Drag and drop your MRI scan
            </h3>
            <p className="text-sm text-gray-400">
              or click to browse (JPEG, PNG, DICOM)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
