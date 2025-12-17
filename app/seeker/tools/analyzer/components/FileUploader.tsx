'use client';

import React, { useState, useRef } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { FileWithPreview } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept: Record<string, string[]>;
  maxFiles?: number;
  label: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  accept, 
  maxFiles = 1,
  label 
}) => {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0] as FileWithPreview;
      selectedFile.preview = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0] as FileWithPreview;
      selectedFile.preview = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
            ${isDragActive 
              ? 'border-[#556B2F] bg-[#556B2F]/10' 
              : 'border-gray-300 hover:border-[#556B2F] hover:bg-gray-50'
            }`}
        >
          <input 
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <ArrowUpTrayIcon className="w-10 h-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 
                'Drop the file here' : 
                `Drag & drop your ${label} file here, or click to browse`
              }
            </p>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center p-4 mt-3 bg-gray-50 rounded-lg border border-gray-200">
          <DocumentTextIcon className="w-6 h-6 text-[#556B2F] mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;

