import { NextRequest, NextResponse } from 'next/server';
import {
  extractCvFromText,
  extractTextFromBuffer,
  getFileExtension,
  isSupportedCvFile,
  toCvData,
} from '@/app/seeker/tools/cv-maker/Extractor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

type PdfParseFn = (buffer: Buffer) => Promise<{ text?: string }>;

/** Native Node require — webpack must not bundle pdf-parse (see next.config.js externals). */
function loadPdfParse(): PdfParseFn {
  // eslint-disable-next-line no-eval
  const nodeRequire = eval('require') as NodeRequire;
  const loaded = nodeRequire('pdf-parse') as PdfParseFn | { default: PdfParseFn };
  const fn = typeof loaded === 'function' ? loaded : loaded.default;
  if (typeof fn !== 'function') {
    throw new Error('pdf-parse module did not load correctly');
  }
  return fn;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = loadPdfParse();
  const result = await pdfParse(buffer);
  const text = (result.text ?? '').trim();
  if (!text) {
    throw new Error(
      'Could not extract text from the PDF. Try a text-based PDF or a .docx file.'
    );
  }
  return text;
}

async function extractCvFileText(buffer: Buffer, filename: string): Promise<string> {
  if (getFileExtension(filename) === '.pdf') {
    return extractPdfText(buffer);
  }
  return extractTextFromBuffer(buffer, filename);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!isSupportedCvFile(file.name)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .txt, .pdf, or .docx file.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await extractCvFileText(buffer, file.name);
    const extraction = await extractCvFromText(cvText);
    const mapped = toCvData(extraction);

    return NextResponse.json({
      success: true,
      ...mapped,
    });
  } catch (error) {
    console.error('CV extraction error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to extract CV content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
