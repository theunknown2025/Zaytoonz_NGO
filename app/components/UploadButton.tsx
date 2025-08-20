"use client";

import { useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/app/lib/supabase";

interface UploadButtonProps {
  label: string;
  onUpload: (url: string) => void;
  bucket?: string;
  path?: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  label,
  onUpload,
  bucket = "documents",
  path = "uploads"
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${path}/${fileName}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setIsUploading(false);
      onUpload(publicURLData.publicUrl);
      
      // Reset the input
      event.target.value = "";
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset the input
      event.target.value = "";
    }
  };

  return (
    <div className="relative">
      <label 
        className={`
          inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
          ${isUploading 
            ? "bg-gray-300 text-gray-700 cursor-wait" 
            : "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-sm hover:shadow-md cursor-pointer transform transition-all duration-200 hover:scale-[1.02]"
          }
        `}
        htmlFor="file-upload"
      >
        {isUploading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <CloudArrowUpIcon className="w-4 w-4 mr-2" />
        )}
        {isUploading ? "Uploading..." : label}
      </label>
      <input
        id="file-upload"
        type="file"
        className="absolute w-0 h-0 opacity-0 overflow-hidden"
        onChange={handleFileChange}
        disabled={isUploading}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
      />
    </div>
  );
}; 