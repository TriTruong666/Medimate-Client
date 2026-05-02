export type Package = {
  packageId: string;
  packageName: string;
  price: number;
  currency: "VND" | string;
  durationDays: number;
  memberLimit: number;
  ocrLimit: number;
  allowVideoRecordingAccess: boolean;
  healthAlertEnabled: boolean;
  description: string;
  activeSubscriberCount: number;
  status: "active" | "inactive";
};

export type UpdatePackageRequest = {
  packageName: string;
  price: number;
  currency: string;
  durationDays: number;
  memberLimit: number;
  ocrLimit: number;
  allowVideoRecordingAccess: boolean;
  healthAlertEnabled: boolean;
  description: string;
};
