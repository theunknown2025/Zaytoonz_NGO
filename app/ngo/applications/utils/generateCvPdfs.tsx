'use client';

import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import CVPreview from '@/app/seeker/tools/cv-maker/components/CVPreview';
import { canvasToPdf, rasterizeSvgIcons } from '@/app/seeker/tools/cv-maker/exportCvPdf';
import { mapStoredCv } from '../components/CvPreviewModal';

export interface CvExportItem {
  applicationId: string;
  cvId: string;
  candidateName: string;
}

export interface CvExportResult {
  generated: number;
  failed: { candidateName: string; error: string }[];
}

const A4_WIDTH_PX = 794;

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_').slice(0, 80) || 'CV';
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 50)));
  });
}

async function renderCvToPdf(cvId: string): Promise<Blob> {
  const response = await fetch(`/api/cvs/${cvId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load CV');
  const { cvData, addedSections, palette } = mapStoredCv(data);

  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:0;top:${typeof window !== 'undefined' ? window.scrollY : 0}px;width:${A4_WIDTH_PX}px;background:#fff;z-index:-1;pointer-events:none;`;
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(<CVPreview cvData={cvData} addedSections={addedSections} palette={palette} />);
    await waitForPaint();

    const preview = (container.firstElementChild as HTMLElement | null) ?? container;
    await rasterizeSvgIcons(preview);
    const canvas = await html2canvas(preview, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: preview.scrollWidth,
      height: preview.scrollHeight + 16,
      windowWidth: preview.scrollWidth,
      windowHeight: preview.scrollHeight + 16,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    return canvasToPdf(canvas).output('blob');
  } finally {
    root.unmount();
    container.remove();
  }
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates PDFs for the given CVs one by one. A single CV downloads as a PDF;
 * several CVs are bundled into one ZIP file.
 */
export async function exportCandidateCvs(
  items: CvExportItem[],
  zipName: string,
  onProgress: (done: number, total: number) => void
): Promise<CvExportResult> {
  const total = items.length;
  const files: { name: string; blob: Blob }[] = [];
  const failed: CvExportResult['failed'] = [];
  const usedNames = new Set<string>();

  onProgress(0, total);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const blob = await renderCvToPdf(item.cvId);
      let name = `${sanitizeFileName(item.candidateName)}_CV`;
      for (let n = 2; usedNames.has(name); n++) name = `${sanitizeFileName(item.candidateName)}_CV_${n}`;
      usedNames.add(name);
      files.push({ name: `${name}.pdf`, blob });
    } catch (error) {
      failed.push({
        candidateName: item.candidateName,
        error: error instanceof Error ? error.message : 'Failed to generate CV',
      });
    }
    onProgress(i + 1, total);
  }

  if (files.length === 1 && total === 1) {
    triggerDownload(files[0].blob, files[0].name);
  } else if (files.length > 0) {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.name, file.blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, `${sanitizeFileName(zipName)}.zip`);
  }

  return { generated: files.length, failed };
}
