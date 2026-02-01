// Image processing utilities for sketch conversion
// All processing happens client-side using Canvas API

export type SketchMode = 'pencil' | 'ink' | 'lineart' | 'coloring';

export interface ProcessingSettings {
  mode: SketchMode;
  lineThickness: number;
  edgeIntensity: number;
  contrast: number;
  noiseReduction: number;
  smoothing: number;
  brightness: number;
}

export const defaultSettings: ProcessingSettings = {
  mode: 'pencil',
  lineThickness: 1,
  edgeIntensity: 50,
  contrast: 50,
  noiseReduction: 30,
  smoothing: 20,
  brightness: 50,
};

// Convert image to grayscale
function toGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  return imageData;
}

// Apply Gaussian blur
function gaussianBlur(imageData: ImageData, radius: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  const sigma = radius / 3;
  const kernel: number[] = [];
  const kernelSize = radius * 2 + 1;
  let kernelSum = 0;
  
  for (let i = -radius; i <= radius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
    kernelSum += val;
  }
  
  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= kernelSum;
  }
  
  // Horizontal pass
  const temp = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = -radius; k <= radius; k++) {
        const px = Math.min(Math.max(x + k, 0), width - 1);
        const idx = (y * width + px) * 4;
        const kVal = kernel[k + radius];
        r += data[idx] * kVal;
        g += data[idx + 1] * kVal;
        b += data[idx + 2] * kVal;
        a += data[idx + 3] * kVal;
      }
      const idx = (y * width + x) * 4;
      temp[idx] = r;
      temp[idx + 1] = g;
      temp[idx + 2] = b;
      temp[idx + 3] = a;
    }
  }
  
  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = -radius; k <= radius; k++) {
        const py = Math.min(Math.max(y + k, 0), height - 1);
        const idx = (py * width + x) * 4;
        const kVal = kernel[k + radius];
        r += temp[idx] * kVal;
        g += temp[idx + 1] * kVal;
        b += temp[idx + 2] * kVal;
        a += temp[idx + 3] * kVal;
      }
      const idx = (y * width + x) * 4;
      output[idx] = r;
      output[idx + 1] = g;
      output[idx + 2] = b;
      output[idx + 3] = a;
    }
  }
  
  return new ImageData(output, width, height);
}

// Sobel edge detection
function sobelEdgeDetection(imageData: ImageData, intensity: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  const multiplier = intensity / 50;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const pixel = data[idx];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += pixel * sobelX[kernelIdx];
          gy += pixel * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) * multiplier;
      const idx = (y * width + x) * 4;
      const edge = 255 - Math.min(255, magnitude);
      output[idx] = edge;
      output[idx + 1] = edge;
      output[idx + 2] = edge;
      output[idx + 3] = 255;
    }
  }
  
  return new ImageData(output, width, height);
}

// Canny-like edge detection for cleaner lines
function cannyEdgeDetection(imageData: ImageData, intensity: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);
  
  const threshold = (100 - intensity) * 2;
  
  // Compute gradients
  const gradients: number[] = [];
  const directions: number[] = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const pixel = data[idx];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += pixel * sobelX[kernelIdx];
          gy += pixel * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const direction = Math.atan2(gy, gx);
      
      gradients[y * width + x] = magnitude;
      directions[y * width + x] = direction;
    }
  }
  
  // Non-maximum suppression and thresholding
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const magnitude = gradients[y * width + x];
      
      if (magnitude > threshold) {
        output[idx] = 0;
        output[idx + 1] = 0;
        output[idx + 2] = 0;
      } else {
        output[idx] = 255;
        output[idx + 1] = 255;
        output[idx + 2] = 255;
      }
      output[idx + 3] = 255;
    }
  }
  
  return new ImageData(output, width, height);
}

// Apply contrast adjustment
function applyContrast(imageData: ImageData, contrast: number): ImageData {
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }
  
  return imageData;
}

// Apply brightness adjustment
function applyBrightness(imageData: ImageData, brightness: number): ImageData {
  const data = imageData.data;
  const adjustment = (brightness - 50) * 2.55;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
  }
  
  return imageData;
}

// Apply thresholding for coloring page mode
function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] > threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  
  return imageData;
}

// Dilate lines (make them thicker)
function dilateLine(imageData: ImageData, iterations: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  let data = new Uint8ClampedArray(imageData.data);
  
  for (let iter = 0; iter < iterations; iter++) {
    const output = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let minVal = 255;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            minVal = Math.min(minVal, data[nIdx]);
          }
        }
        
        output[idx] = minVal;
        output[idx + 1] = minVal;
        output[idx + 2] = minVal;
        output[idx + 3] = 255;
      }
    }
    
    data = output;
  }
  
  return new ImageData(data, width, height);
}

// Main processing function for pencil sketch
function processPencilSketch(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  let imageData = ctx.getImageData(0, 0, width, height);
  
  // Apply brightness
  imageData = applyBrightness(imageData, settings.brightness);
  
  // Convert to grayscale
  imageData = toGrayscale(imageData);
  
  // Apply noise reduction (blur)
  const blurRadius = Math.max(1, Math.floor(settings.noiseReduction / 15));
  imageData = gaussianBlur(imageData, blurRadius);
  
  // Edge detection
  imageData = sobelEdgeDetection(imageData, settings.edgeIntensity);
  
  // Apply contrast
  const contrastValue = (settings.contrast - 50) * 2;
  imageData = applyContrast(imageData, contrastValue);
  
  // Line thickness
  if (settings.lineThickness > 1) {
    imageData = dilateLine(imageData, settings.lineThickness - 1);
  }
  
  return imageData;
}

// Main processing function for ink outline
function processInkOutline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  let imageData = ctx.getImageData(0, 0, width, height);
  
  imageData = applyBrightness(imageData, settings.brightness);
  imageData = toGrayscale(imageData);
  
  const blurRadius = Math.max(1, Math.floor(settings.smoothing / 10));
  imageData = gaussianBlur(imageData, blurRadius);
  
  imageData = cannyEdgeDetection(imageData, settings.edgeIntensity);
  
  if (settings.lineThickness > 1) {
    imageData = dilateLine(imageData, settings.lineThickness);
  }
  
  return imageData;
}

// Main processing function for line art
function processLineArt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  let imageData = ctx.getImageData(0, 0, width, height);
  
  imageData = applyBrightness(imageData, settings.brightness);
  imageData = toGrayscale(imageData);
  
  const blurRadius = Math.max(2, Math.floor(settings.noiseReduction / 10));
  imageData = gaussianBlur(imageData, blurRadius);
  
  imageData = sobelEdgeDetection(imageData, settings.edgeIntensity * 0.7);
  
  const threshold = 255 - (settings.contrast * 1.5);
  imageData = applyThreshold(imageData, threshold);
  
  if (settings.lineThickness > 1) {
    imageData = dilateLine(imageData, settings.lineThickness - 1);
  }
  
  return imageData;
}

// Main processing function for coloring page
function processColoringPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: ProcessingSettings
): ImageData {
  let imageData = ctx.getImageData(0, 0, width, height);
  
  imageData = applyBrightness(imageData, settings.brightness);
  imageData = toGrayscale(imageData);
  
  // Heavy blur for clean outlines
  const blurRadius = Math.max(3, Math.floor(settings.smoothing / 8));
  imageData = gaussianBlur(imageData, blurRadius);
  
  // Strong edge detection
  imageData = cannyEdgeDetection(imageData, settings.edgeIntensity * 1.2);
  
  // Thick lines for coloring
  const thickness = Math.max(2, settings.lineThickness);
  imageData = dilateLine(imageData, thickness);
  
  return imageData;
}

// Main export function to process image
export function processImage(
  canvas: HTMLCanvasElement,
  settings: ProcessingSettings
): ImageData {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');
  
  const width = canvas.width;
  const height = canvas.height;
  
  switch (settings.mode) {
    case 'pencil':
      return processPencilSketch(ctx, width, height, settings);
    case 'ink':
      return processInkOutline(ctx, width, height, settings);
    case 'lineart':
      return processLineArt(ctx, width, height, settings);
    case 'coloring':
      return processColoringPage(ctx, width, height, settings);
    default:
      return processPencilSketch(ctx, width, height, settings);
  }
}

// Create transparent version (line art only)
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

// Resize image if too large
export function resizeImage(
  img: HTMLImageElement,
  maxSize: number = 2000
): { width: number; height: number } {
  let { width, height } = img;
  
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  return { width, height };
}
