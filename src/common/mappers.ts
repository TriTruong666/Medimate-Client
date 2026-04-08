export type GenderValue = string | null | undefined;

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