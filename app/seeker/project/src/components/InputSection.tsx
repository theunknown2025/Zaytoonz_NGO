import React, { useState } from 'react';
import FileUploader from './FileUploader';
import TextInput from './TextInput';
import TabSelector from './TabSelector';
import { InputMethod, TextContent } from '../types';

interface InputSectionProps {
  title: string;
  description: string;
  onContentChange: (content: TextContent) => void;
  placeholder: string;
  inputLabel: string;
}

const InputSection: React.FC<InputSectionProps> = ({
  title,
  description,
  onContentChange,
  placeholder,
  inputLabel,
}) => {
  const [inputMethod, setInputMethod] = useState<InputMethod>('upload');

  const handleFileSelect = async (file: File) => {
    try {
      // In a real implementation, we would use a PDF parsing library
      // For now, just notify that we'd process the file
      onContentChange({
        text: `[This would contain the extracted text from ${file.name}]`,
        source: 'upload',
        fileName: file.name,
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const handleTextInput = (text: string) => {
    onContentChange({
      text,
      source: 'paste',
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6 animate-slide-up">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <TabSelector
        activeTab={inputMethod}
        onTabChange={setInputMethod}
        label={inputLabel}
      />

      {inputMethod === 'upload' ? (
        <FileUploader
          onFileSelect={handleFileSelect}
          accept={{
            'application/pdf': ['.pdf'],
          }}
          label={inputLabel}
        />
      ) : (
        <TextInput
          onTextInput={handleTextInput}
          placeholder={placeholder}
          label={inputLabel}
        />
      )}
    </div>
  );
};

export default InputSection;