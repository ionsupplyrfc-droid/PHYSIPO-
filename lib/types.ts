export type Role = "player" | "staff" | "coach";

export type DiseaseCategory = "脳血管" | "廃用" | "運動器";

export interface SessionUser {
  userId: number;
  name: string;
  role: Role;
}

export interface RomMmtValue {
  label: string;
  left: number;
  right: number;
}

export type RomMmtData = Record<string, RomMmtValue>;

export interface CaseRecord {
  id: number;
  user_id: number;
  case_code: string;
  disease_category: DiseaseCategory;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: number;
  case_id: number;
  user_id: number;
  intervention_day: number | null;
  age: number | null;
  rom_data: RomMmtData;
  mmt_data: RomMmtData;
  disease_specific_data: Record<string, unknown>;
  intervention_content: string | null;
  assessment: string | null;
  created_at: string;
  updated_at: string;
  case_code?: string;
  disease_category?: DiseaseCategory;
  recorder_name?: string;
  tags?: string[];
}

export interface TemplateRecord {
  id: number;
  user_id: number;
  name: string;
  disease_category: DiseaseCategory;
  template_data: {
    rom_data?: RomMmtData;
    mmt_data?: RomMmtData;
    disease_specific_data?: Record<string, unknown>;
    tags?: string[];
  };
  created_at: string;
  updated_at: string;
}
