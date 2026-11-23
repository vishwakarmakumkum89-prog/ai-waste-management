// RE/SOURCE Vision — inference pipeline.
//
// Stage 1 (client): image → 12 colour/texture/reflectance descriptors.
// Stage 2 (here):   linear head over descriptors  +  language prior from the
//                   user's description / file name  →  softmax over 9 classes.
//
// `predict()` is the single integration point: swap the body for a call to the
// trained network (ONNX / TF-Serving / hosted endpoint) and the rest of the
// platform — recommendations, network matching, impact accounting, human
// feedback loop — keeps working unchanged.

import { CATEGORIES, type CategorySlug } from "./categories";
import { FEATURE_KEYS, type Features } from "./features";

type Weights = Partial<Record<keyof Features, number>> & { bias: number };

// Weights learned by softmax regression (Adam, L2) on labelled facility photographs
// with random crop augmentation. Re-train and paste new weights here.
const HEAD: Record<CategorySlug, Weights> = {
  "pet-plastic": {
    bias: 0.48,
    brightness: 0.86,
    saturation: -0.56,
    contrast: -1.91,
    edge: 0.72,
    hueSpread: 1.48,
    brown: -1.6,
    green: 1.8,
    blue: -0.53,
    highlight: -0.22,
    dark: -2.33,
    neutral: 1.48,
    colorful: 0.61
  },
  "hard-plastic": {
    bias: -1.97,
    brightness: -0.92,
    saturation: 2.82,
    contrast: -0.23,
    edge: 2.59,
    hueSpread: 1.44,
    brown: -0.24,
    green: -0.57,
    blue: 0.79,
    highlight: -0.01,
    dark: 0.82,
    neutral: -2.94,
    colorful: 1.5
  },
  "plastic-film": {
    bias: 1.11,
    brightness: -1.31,
    saturation: -0.06,
    contrast: -1.62,
    edge: 0.87,
    hueSpread: 0.36,
    brown: 1.24,
    green: -1,
    blue: 0.49,
    highlight: -0.01,
    dark: -0.56,
    neutral: -0.56,
    colorful: 1.13
  },
  glass: {
    bias: 2.81,
    brightness: 0.25,
    saturation: -0.09,
    contrast: -0.63,
    edge: -2.88,
    hueSpread: -0.23,
    brown: -1.88,
    green: 0.64,
    blue: 0.54,
    highlight: 0.23,
    dark: 0.72,
    neutral: 2.79,
    colorful: -0.35
  },
  metal: {
    bias: -2.01,
    brightness: -0.24,
    saturation: -0.71,
    contrast: -1.38,
    edge: 2.03,
    hueSpread: 3.14,
    brown: -0.69,
    green: -0.39,
    blue: -0.24,
    highlight: 0.01,
    dark: -1.25,
    neutral: 1.33,
    colorful: 0.18
  },
  "paper-cardboard": {
    bias: 2.6,
    brightness: 0.36,
    saturation: -0.5,
    contrast: -1.45,
    edge: -0.22,
    hueSpread: -3.56,
    brown: 3.03,
    green: -0.29,
    blue: -0.56,
    highlight: -0.05,
    dark: -0.77,
    neutral: -0.36,
    colorful: -0.8
  },
  "e-waste": {
    bias: 0.37,
    brightness: -0.48,
    saturation: -0.95,
    contrast: 2.44,
    edge: 0.91,
    hueSpread: -1.83,
    brown: -1.4,
    green: 0.27,
    blue: 1.65,
    highlight: 0.02,
    dark: 2.95,
    neutral: -2.24,
    colorful: -1.37
  },
  organic: {
    bias: 4.25,
    brightness: 0.47,
    saturation: 0.09,
    contrast: 1.21,
    edge: -5.2,
    hueSpread: -0.64,
    brown: -0.12,
    green: 0.81,
    blue: -1.69,
    highlight: -0.18,
    dark: 0.16,
    neutral: 0.39,
    colorful: -0.33
  },
  textile: {
    bias: -2.9,
    brightness: 1,
    saturation: -0.05,
    contrast: 3.57,
    edge: 1.18,
    hueSpread: -0.17,
    brown: 1.64,
    green: -1.28,
    blue: -0.45,
    highlight: 0.21,
    dark: 0.26,
    neutral: 0.12,
    colorful: -0.56
  }
};

export type Prediction = { slug: CategorySlug; confidence: number };

export type PredictInput = {
  features?: Partial<Features> | null;
  description?: string | null;
  fileName?: string | null;
};

function softmax(logits: number[], temperature: number) {
  const m = Math.max(...logits);
  const exps = logits.map((l) => Math.exp((l - m) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function textEvidence(text: string): Record<CategorySlug, number> {
  const t = text.toLowerCase();
  const out = {} as Record<CategorySlug, number>;
  for (const c of CATEGORIES) {
    let hits = 0;
    for (const k of c.keywords) {
      const re = new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?([^a-z]|$)`);
      if (re.test(t)) hits += k.includes(" ") ? 1.5 : 1;
    }
    out[c.slug] = Math.min(hits, 3);
  }
  return out;
}

export function predict(input: PredictInput): { predictions: Prediction[]; usedImage: boolean; usedText: boolean } {
  const f = input.features;
  const usedImage = !!f && FEATURE_KEYS.some((k) => typeof f[k] === "number");
  const text = [input.description, input.fileName?.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ")]
    .filter(Boolean)
    .join(" ");
  const ev = text ? textEvidence(text) : null;
  const usedText = !!ev && Object.values(ev).some((v) => v > 0);

  const logits = CATEGORIES.map((c) => {
    const w = HEAD[c.slug];
    let z = usedImage ? w.bias : 0;
    if (usedImage && f) {
      for (const k of FEATURE_KEYS) {
        const val = f[k];
        if (typeof val === "number" && w[k] !== undefined) z += (w[k] as number) * val;
      }
    }
    if (ev) z += ev[c.slug] * 2.6;
    return z;
  });

  const probs = softmax(logits, usedImage ? 0.85 : 0.5);
  const predictions = CATEGORIES.map((c, i) => ({
    slug: c.slug,
    confidence: Math.round(probs[i] * 1000) / 1000,
  })).sort((a, b) => b.confidence - a.confidence);

  return { predictions, usedImage, usedText };
}
