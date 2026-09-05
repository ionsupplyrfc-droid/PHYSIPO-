import { DiseaseCategory, RomMmtData } from "./types";

export const DISEASE_CATEGORIES: DiseaseCategory[] = ["脳血管", "廃用", "運動器"];

// ROM（関節可動域）初期項目。part追加にも対応できるよう key/label/範囲を定義する。
export const DEFAULT_ROM_ITEMS: { key: string; label: string; min: number; max: number }[] = [
  { key: "hip_flexion", label: "股関節 屈曲", min: 0, max: 130 },
  { key: "hip_extension", label: "股関節 伸展", min: 0, max: 30 },
  { key: "hip_abduction", label: "股関節 外転", min: 0, max: 45 },
  { key: "hip_adduction", label: "股関節 内転", min: 0, max: 30 },
  { key: "knee_flexion", label: "膝関節 屈曲", min: 0, max: 150 },
  { key: "knee_extension", label: "膝関節 伸展", min: 0, max: 15 },
  { key: "ankle_dorsiflexion", label: "足関節 背屈", min: 0, max: 20 },
  { key: "ankle_plantarflexion", label: "足関節 底屈", min: 0, max: 50 },
];

// MMT（徒手筋力テスト）初期項目。0〜5の6段階。
export const DEFAULT_MMT_ITEMS: { key: string; label: string; min: number; max: number }[] = [
  { key: "hip_flexion", label: "股関節 屈曲", min: 0, max: 5 },
  { key: "hip_extension", label: "股関節 伸展", min: 0, max: 5 },
  { key: "knee_flexion", label: "膝関節 屈曲", min: 0, max: 5 },
  { key: "knee_extension", label: "膝関節 伸展", min: 0, max: 5 },
  { key: "ankle_dorsiflexion", label: "足関節 背屈", min: 0, max: 5 },
  { key: "ankle_plantarflexion", label: "足関節 底屈", min: 0, max: 5 },
];

export function buildDefaultRomData(): RomMmtData {
  const data: RomMmtData = {};
  for (const item of DEFAULT_ROM_ITEMS) {
    data[item.key] = { label: item.label, left: 0, right: 0 };
  }
  return data;
}

export function buildDefaultMmtData(): RomMmtData {
  const data: RomMmtData = {};
  for (const item of DEFAULT_MMT_ITEMS) {
    data[item.key] = { label: item.label, left: 0, right: 0 };
  }
  return data;
}

export const SENSORY_OPTIONS = ["正常", "軽度鈍麻", "中等度鈍麻", "高度鈍麻", "消失"] as const;
export const BRUNNSTROM_OPTIONS = ["I", "II", "III", "IV", "V", "VI"] as const;
export const MAS_OPTIONS = ["0", "1", "1+", "2", "3", "4"] as const;

export const COOKIE_NAME = "physipo_session";
