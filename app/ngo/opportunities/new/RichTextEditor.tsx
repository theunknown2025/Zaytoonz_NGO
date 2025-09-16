'use client';

import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  
  return (
    <div className="rounded-lg overflow-hidden">
      <Editor
        apiKey="8zqtjlumo8xzy2pnjvfrjfi9w3bxr22h3kvgt2cqgxg8ianm"
        value={value}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; text-align: left; }',
          directionality: 'ltr',
          language: 'en',
          setup: (editor) => {
            editor.on('init', () => {
              editor.getBody().style.direction = 'ltr';
              editor.getBody().style.textAlign = 'left';
            });
          }
        }}
        onEditorChange={onChange}
      />
    </div>
  );
} 