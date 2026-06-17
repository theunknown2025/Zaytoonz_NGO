import mammoth from 'mammoth';

const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx'] as const;
type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

export function isSupportedCvFile(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getFileExtension(filename) as SupportedExtension);
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = getFileExtension(filename);

  switch (ext) {
    case '.txt':
      return buffer.toString('utf-8').trim();

    case '.pdf':
      throw new Error('PDF parsing must be handled by the API route.');

    case '.docx':
      return extractTextFromDocx(buffer);

    default:
      throw new Error(
        `Unsupported file type "${ext}". Please upload a .txt, .pdf, or .docx file.`
      );
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value ?? '').trim();
  if (!text) {
    throw new Error('Could not extract text from the Word document.');
  }
  return text;
}
