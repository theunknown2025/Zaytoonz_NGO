'use client';

import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CVPreview from './components/CVPreview';
import type { CvPaletteId } from './sectionConfig';
import type { CVData } from './types';

const A4_WIDTH_PX = 794;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
/** White space kept at the top and bottom of every PDF page so borders and text are not sliced off. */
const PAGE_MARGIN_MM = 10;

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 80)));
  });
}

/** html2canvas drops Heroicon strokes, so each icon is painted and swapped for an image. */
export async function rasterizeSvgIcons(root: HTMLElement) {
  const icons = Array.from(root.querySelectorAll('svg'));
  await Promise.all(
    icons.map(
      (svg) =>
        new Promise<void>((resolve) => {
          const computed = getComputedStyle(svg);
          const width = svg.getBoundingClientRect().width || parseFloat(computed.width) || 16;
          const height = svg.getBoundingClientRect().height || parseFloat(computed.height) || 16;
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          clone.setAttribute('width', String(width));
          clone.setAttribute('height', String(height));
          const color =
            computed.color && computed.color !== 'rgba(0, 0, 0, 0)' ? computed.color : '#111827';
          const sources = Array.from(
            svg.querySelectorAll('path, line, circle, polyline, polygon, rect')
          );
          Array.from(clone.querySelectorAll('path, line, circle, polyline, polygon, rect')).forEach(
            (node, index) => {
              const shape = node as SVGElement;
              const shapeStyle = getComputedStyle(sources[index] || svg);
              const stroke =
                shapeStyle.stroke && shapeStyle.stroke !== 'none' ? shapeStyle.stroke : color;
              const fill = shapeStyle.fill && shapeStyle.fill !== 'none' ? shapeStyle.fill : 'none';
              shape.setAttribute('stroke', stroke);
              shape.setAttribute('fill', fill);
              shape.setAttribute('stroke-width', shapeStyle.strokeWidth || '1.5');
              shape.setAttribute('stroke-linecap', shapeStyle.strokeLinecap || 'round');
              shape.setAttribute('stroke-linejoin', shapeStyle.strokeLinejoin || 'round');
            }
          );

          const xml = new XMLSerializer().serializeToString(clone);
          const image = new Image();
          image.onload = () => {
            image.width = width;
            image.height = height;
            image.style.width = `${width}px`;
            image.style.height = `${height}px`;
            image.style.display = 'block';
            svg.replaceWith(image);
            resolve();
          };
          image.onerror = () => resolve();
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
        })
    )
  );
}

function findQuietRow(canvas: HTMLCanvasElement, idealY: number, minY: number) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || idealY <= minY + 1) return idealY;

  const searchFloor = Math.max(minY + 1, idealY - 120);
  const samples = 28;

  for (let y = idealY; y > searchFloor; y -= 1) {
    const row = context.getImageData(0, y, canvas.width, 1).data;
    let light = 0;
    for (let i = 0; i < samples; i += 1) {
      const offset = Math.floor(((i + 0.5) / samples) * canvas.width) * 4;
      if (row[offset] > 248 && row[offset + 1] > 248 && row[offset + 2] > 248) light += 1;
    }
    if (light >= samples - 1) return y;
  }

  return idealY;
}

/** Place the captured CV onto A4 pages with a top and bottom margin on every page. */
export function canvasToPdf(canvas: HTMLCanvasElement) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const printableMm = PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2;
  const pxPerMm = canvas.width / PAGE_WIDTH_MM;
  const slicePx = Math.max(1, Math.floor(printableMm * pxPerMm));

  let offset = 0;
  let page = 0;

  while (offset < canvas.height - 1 && page < 40) {
    let end = Math.min(offset + slicePx, canvas.height);
    if (end < canvas.height) {
      end = findQuietRow(canvas, end, offset + Math.floor(slicePx * 0.6));
    }
    if (end <= offset) end = Math.min(offset + slicePx, canvas.height);

    const height = end - offset;
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = height;
    const context = pageCanvas.getContext('2d');
    if (!context) break;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);

    if (page > 0) pdf.addPage();
    pdf.addImage(
      pageCanvas.toDataURL('image/png'),
      'PNG',
      0,
      PAGE_MARGIN_MM,
      PAGE_WIDTH_MM,
      height / pxPerMm
    );

    offset = end;
    page += 1;
  }

  return pdf;
}

export async function captureCvPreview(cvData: CVData, addedSections: string[], palette?: CvPaletteId) {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:absolute',
    'left:0',
    `top:${window.scrollY}px`,
    `width:${A4_WIDTH_PX}px`,
    'background:#ffffff',
    'z-index:-1',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    root.render(<CVPreview cvData={cvData} addedSections={addedSections} palette={palette} />);
    await waitForPaint();

    const preview = (container.firstElementChild as HTMLElement | null) ?? container;
    await rasterizeSvgIcons(preview);

    return await html2canvas(preview, {
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
  } finally {
    root.unmount();
    container.remove();
  }
}

export async function downloadCvPdf(options: {
  cvData: CVData;
  addedSections: string[];
  palette?: CvPaletteId;
  filename: string;
}) {
  const canvas = await captureCvPreview(options.cvData, options.addedSections, options.palette);
  canvasToPdf(canvas).save(options.filename);
}
