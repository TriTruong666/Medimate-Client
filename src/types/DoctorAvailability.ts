export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek | string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorAvailabilityBody {
  dayOfWeek: DayOfWeek | string;
  startTime: string;
  endTime: string;
}

export interface UpdateDoctorAvailabilityBody {
  dayOfWeek: DayOfWeek | string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
