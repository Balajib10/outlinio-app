// Export utilities for print-ready formats

export type ExportFormat = 'png' | 'jpg' | 'transparent' | 'print-a4' | 'coloring-book' | 'bw-print';

// A4 dimensions at 300 DPI
const A4_WIDTH_PX = 2480; // 210mm at 300dpi
const A4_HEIGHT_PX = 3508; // 297mm at 300dpi
const A4_MARGIN_PX = 118; // ~10mm margin

export function createTransparentVersion(imageData: ImageData): ImageData {
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = data[i];
    // White becomes transparent, black stays
    const alpha = 255 - brightness;
    output[i] = 0;
    output[i + 1] = 0;
    output[i + 2] = 0;
    output[i + 3] = alpha;
  }
  
  return new ImageData(output, imageData.width, imageData.height);
}

export function createA4PrintLayout(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = A4_WIDTH_PX;
  a4Canvas.height = A4_HEIGHT_PX;
  
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) return a4Canvas;
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
  
  // Calculate scaling to fit image within A4 with margins
  const availableWidth = A4_WIDTH_PX - (A4_MARGIN_PX * 2);
  const availableHeight = A4_HEIGHT_PX - (A4_MARGIN_PX * 2);
  
  const scale = Math.min(
    availableWidth / canvas.width,
    availableHeight / canvas.height
  );
  
  const scaledWidth = canvas.width * scale;
  const scaledHeight = canvas.height * scale;
  
  // Center image on page
  const x = (A4_WIDTH_PX - scaledWidth) / 2;
  const y = (A4_HEIGHT_PX - scaledHeight) / 2;
  
  ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
  
  return a4Canvas;
}

export function createColoringBookExport(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const coloringCanvas = document.createElement('canvas');
  coloringCanvas.width = A4_WIDTH_PX;
  coloringCanvas.height = A4_HEIGHT_PX;
  
  const ctx = coloringCanvas.getContext('2d');
  if (!ctx) return coloringCanvas;
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
  
  // Get source image data and enhance contrast for coloring
  const sourceCtx = canvas.getContext('2d');
  if (!sourceCtx) return coloringCanvas;
  
  const sourceData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = sourceData.data;
  
  // Apply high contrast threshold for clean lines
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg > 180 ? 255 : 0; // High threshold for clean lines
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  
  // Create temp canvas with processed data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(sourceData, 0, 0);
  }
  
  // Scale and center on A4
  const availableWidth = A4_WIDTH_PX - (A4_MARGIN_PX * 2);
  const availableHeight = A4_HEIGHT_PX - (A4_MARGIN_PX * 2);
  
  const scale = Math.min(
    availableWidth / tempCanvas.width,
    availableHeight / tempCanvas.height
  );
  
  const scaledWidth = tempCanvas.width * scale;
  const scaledHeight = tempCanvas.height * scale;
  
  const x = (A4_WIDTH_PX - scaledWidth) / 2;
  const y = (A4_HEIGHT_PX - scaledHeight) / 2;
  
  ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
  
  return coloringCanvas;
}

export function createBWPrintExport(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const bwCanvas = document.createElement('canvas');
  bwCanvas.width = canvas.width;
  bwCanvas.height = canvas.height;
  
  const ctx = bwCanvas.getContext('2d');
  if (!ctx) return bwCanvas;
  
  // Draw original
  ctx.drawImage(canvas, 0, 0);
  
  // Get image data and apply B&W threshold
  const imageData = ctx.getImageData(0, 0, bwCanvas.width, bwCanvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg > 128 ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return bwCanvas;
}

// Convert canvas to blob - more reliable than toDataURL
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Ensure canvas has valid dimensions
    if (!canvas.width || !canvas.height) {
      reject(new Error('Canvas has invalid dimensions'));
      return;
    }
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      type === 'image/jpeg' ? quality : undefined
    );
  });
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement, 
  filename: string, 
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<void> {
  // Validate canvas
  if (!canvas || !canvas.width || !canvas.height) {
    console.error('Invalid canvas for download:', { width: canvas?.width, height: canvas?.height });
    return;
  }

  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = await canvasToBlob(canvas, mimeType, quality);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to dataURL method
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
