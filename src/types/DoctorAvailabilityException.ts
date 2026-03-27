export interface DoctorAvailabilityException {
  exceptionId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  isAvailableOverride: boolean;
}

export interface CreateDoctorAvailabilityExceptionBody {
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
  isAvailableOverride: boolean;
}

export interface UpdateDoctorAvailabilityExceptionBody {
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
  isAvailableOverride: boolean;
}

export interface GetDoctorAvailabilityExceptionsQuery {
  doctorId?: string;
  isAvailableOverride?: boolean;
  dateFrom?: string;
  dateTo?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
