export type SSENotification = {
  type: string;
  timestamp: string;
  payload: {
    title: string;
    body: string;
    alert_type: "info" | "success" | "warning" | "error";
    collection_id?: string;
    document_ids?: string[];
  };
};

export type SSEProcessUpdate = {
  collection_id: string;
  status: "indexing" | "indexed" | "failed";
  progress: number;
  message: string;
};

export type SSEProcessLog = {
  message: string;
  status: "info" | "success" | "warning" | "error";
  progress: number;
};
