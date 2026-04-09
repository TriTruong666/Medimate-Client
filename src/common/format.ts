export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat("vi-VN").format(price);
  return `${formatted} VND`;
};

export const formatTime = (input: string, isIso = false): string => {
  if (isIso) {
    const date = new Date(input);
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Sử dụng định dạng 24h
    }).format(date);
  }
  const timeParts = input.split(":");
  if (timeParts.length >= 2) {
    const hours = timeParts[0].padStart(2, "0");
    const minutes = timeParts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return input;
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
};

export const convertToVNDateISOString = (localDateTime: string): string => {
  const date = new Date(localDateTime);
  if (Number.isNaN(date.getTime())) return "";

  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString();
};

export const formatPriceDisplay = (value: string): string => {
  const numeric = value.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatRelativeTime = (
  dateString: string,
  isUTC?: boolean,
): string => {
  const date = new Date(dateString);
  isUTC = isUTC ?? true;

  // Convert UTC -> Vietnam timezone (UTC+7)
  const vnTime = isUTC ? new Date(date.getTime() + 7 * 60 * 60 * 1000) : date;

  const now = new Date();
  // const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const nowVN = new Date(now.getTime());
  console.log("vnTime:", vnTime);
  console.log("nowVN:", nowVN);

  const diffMs = nowVN.getTime() - vnTime.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Bây giờ";
  }
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }
  if (diffHour < 24) {
    return `${diffHour} tiếng trước`;
  }
  if (diffDay >= 1) {
    const day = vnTime.getDate().toString().padStart(2, "0");
    const month = (vnTime.getMonth() + 1).toString().padStart(2, "0");
    const year = vnTime.getFullYear();
    const hours = vnTime.getHours().toString().padStart(2, "0");
    const minutes = vnTime.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
  }

  return "";
};

export const formatDateDistance = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // Future dates
  if (diffSec < 0) {
    return "Sắp tới";
  }

  if (diffSec < 60) {
    return "Vừa xong";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay} ngày trước`;
  }

  // Older than 30 days, show full date
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
