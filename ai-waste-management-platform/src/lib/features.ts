// Pure image-descriptor extraction. Runs in the browser (canvas pixels) and in
// Node (for calibration), so the exact same descriptors feed the classifier.

export const FEATURE_KEYS = [
  "brightness",
  "saturation",
  "contrast",
  "edge",
  "hueSpread",
  "brown",
  "green",
  "blue",
  "highlight",
  "dark",
  "neutral",
  "colorful",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type Features = Record<FeatureKey, number>;

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function extractFeatures(
  data: ArrayLike<number>,
  width: number,
  height: number,
  channels: 3 | 4 = 4,
): Features {
  const n = width * height;
  const lum = new Float32Array(n);
  let sumL = 0;
  let sumS = 0;
  let brown = 0;
  let green = 0;
  let blue = 0;
  let highlight = 0;
  let dark = 0;
  let neutral = 0;
  let colorful = 0;
  const hueBins = new Float32Array(12);
  let satPix = 0;

  for (let i = 0; i < n; i++) {
    const r = data[i * channels] / 255;
    const g = data[i * channels + 1] / 255;
    const b = data[i * channels + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d > 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    lum[i] = l;
    sumL += l;
    sumS += s;
    if (v > 0.9 && s < 0.18) highlight++;
    if (v < 0.2) dark++;
    if (s < 0.14 && v >= 0.2) neutral++;
    if (s > 0.5 && v > 0.25) colorful++;
    if (h >= 15 && h <= 50 && s >= 0.22 && s <= 0.75 && v >= 0.25 && v <= 0.85) brown++;
    if (h >= 70 && h <= 165 && s > 0.2 && v > 0.12) green++;
    if (h >= 180 && h <= 260 && s > 0.2 && v > 0.15) blue++;
    if (s > 0.2 && v > 0.15) {
      hueBins[Math.min(11, Math.floor(h / 30))]++;
      satPix++;
    }
  }

  const meanL = sumL / n;
  let varL = 0;
  for (let i = 0; i < n; i++) varL += (lum[i] - meanL) ** 2;
  const contrast = clamp(Math.sqrt(varL / n) * 3);

  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx = lum[i + 1] - lum[i - 1];
      const gy = lum[i + width] - lum[i - width];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgeCount++;
    }
  }
  const edge = clamp((edgeSum / Math.max(1, edgeCount)) * 5);

  let hueSpread = 0;
  if (satPix / n > 0.05) {
    let ent = 0;
    for (const c of hueBins) {
      if (c > 0) {
        const p = c / satPix;
        ent -= p * Math.log(p);
      }
    }
    hueSpread = clamp(ent / Math.log(12));
  }

  const r = (v: number) => Math.round(v * 1000) / 1000;
  return {
    brightness: r(meanL),
    saturation: r(sumS / n),
    contrast: r(contrast),
    edge: r(edge),
    hueSpread: r(hueSpread),
    brown: r(brown / n),
    green: r(green / n),
    blue: r(blue / n),
    highlight: r(highlight / n),
    dark: r(dark / n),
    neutral: r(neutral / n),
    colorful: r(colorful / n),
  };
}

/** Browser helper: downsample any image source to 96×96 and extract descriptors. */
export function featuresFromImage(img: CanvasImageSource, w: number, h: number): Features {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");
  // centre-crop to square
  const s = Math.min(w, h);
  ctx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  return extractFeatures(data, size, size, 4);
}
