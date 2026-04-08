export type GenderValue = string | null | undefined;

export const DoctorSpecialty = {
  GENERAL_INTERNAL_MEDICINE: "Nội tổng quát",
  PEDIATRICS: "Nhi khoa",
  PSYCHOLOGY_PSYCHIATRY: "Tâm lý - Tâm thần",
  DERMATOLOGY: "Da liễu",
  OBSTETRICS_GYNECOLOGY: "Sản phụ khoa",
  DENTAL_MAXILLOFACIAL: "Răng hàm mặt",
  OPHTHALMOLOGY: "Nhãn khoa",
  NEUROLOGY: "Thần kinh",
  NUTRITION: "Dinh dưỡng",
} as const;

export type DoctorSpecialty =
  (typeof DoctorSpecialty)[keyof typeof DoctorSpecialty];

type GenderMapItem = {
  label: string;
  symbol: string;
  iconName: "female" | "male" | "unknown";
};

const GENDER_MAP: Record<string, GenderMapItem> = {
  female: {
    label: "Nữ",
    symbol: "\u2640",
    iconName: "female",
  },
  male: {
    label: "Nam",
    symbol: "\u2642",
    iconName: "male",
  },
};

const UNKNOWN_GENDER: GenderMapItem = {
  label: "Chưa cập nhật",
  symbol: "",
  iconName: "unknown",
};

const DOCTOR_SPECIALTY_ALIASES: Record<string, DoctorSpecialty> = {
  "noi tong quat": DoctorSpecialty.GENERAL_INTERNAL_MEDICINE,
  "nhi khoa": DoctorSpecialty.PEDIATRICS,
  "tam ly tam than": DoctorSpecialty.PSYCHOLOGY_PSYCHIATRY,
  "da lieu": DoctorSpecialty.DERMATOLOGY,
  "san phu khoa": DoctorSpecialty.OBSTETRICS_GYNECOLOGY,
  "rang ham mat": DoctorSpecialty.DENTAL_MAXILLOFACIAL,
  "nhan khoa": DoctorSpecialty.OPHTHALMOLOGY,
  "than kinh": DoctorSpecialty.NEUROLOGY,
  "dinh duong": DoctorSpecialty.NUTRITION,
};

export function normalizeGender(value: GenderValue): string {
  return value?.trim().toLowerCase() || "";
}

export function getGenderMeta(value: GenderValue): GenderMapItem {
  const normalized = normalizeGender(value);
  return GENDER_MAP[normalized] || UNKNOWN_GENDER;
}

export function getGenderLabel(value: GenderValue): string {
  return getGenderMeta(value).label;
}

export function getGenderSymbol(value: GenderValue): string {
  return getGenderMeta(value).symbol;
}

export function getGenderIconName(
  value: GenderValue,
): "female" | "male" | "unknown" {
  return getGenderMeta(value).iconName;
}

export function getGenderDisplay(
  value: GenderValue,
  options?: { withSymbol?: boolean },
): string {
  const meta = getGenderMeta(value);

  if (!meta.symbol || !options?.withSymbol) {
    return meta.label;
  }

  return `${meta.label} (${meta.symbol})`;
}

function normalizeLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function toDoctorSpecialtyDbValue(
  value: string | null | undefined,
): DoctorSpecialty | null {
  if (!value) return null;

  const raw = value.trim();
  if (!raw) return null;

  const values = Object.values(DoctorSpecialty);
  if (values.includes(raw as DoctorSpecialty)) {
    return raw as DoctorSpecialty;
  }

  return DOCTOR_SPECIALTY_ALIASES[normalizeLookup(raw)] || null;
}

export function getDoctorSpecialtyLabel(value: string | null | undefined): string {
  const normalized = toDoctorSpecialtyDbValue(value);
  return normalized || value?.trim() || "Chưa cập nhật";
}

export function getDoctorSpecialtyOptions(): Array<{
  value: DoctorSpecialty;
  label: string;
}> {
  return Object.values(DoctorSpecialty).map((value) => ({
    value,
    label: value,
  }));
}