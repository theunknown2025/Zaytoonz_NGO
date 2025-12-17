'use client';

import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface TextInputProps {
  onTextInput: (text: string) => void;
  placeholder: string;
  label: string;
}

const TextInput: React.FC<TextInputProps> = ({ onTextInput, placeholder, label }) => {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextInput(newText);
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Paste {label}</h3>
      </div>
      <textarea
        className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F] transition-all"
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        aria-label={`Paste ${label}`}
      />
    </div>
  );
};

export default TextInput;

















