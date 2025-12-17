import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, X, FileText } from 'lucide-react';
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const selectedFile = acceptedFiles[0] as FileWithPreview;
      selectedFile.preview = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

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
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <FileUp className="w-10 h-10 text-gray-400" />
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
        <div className="relative flex items-center p-4 mt-3 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <FileText className="w-6 h-6 text-primary-500 mr-3" />
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;