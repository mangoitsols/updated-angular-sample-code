export interface DocumentsType {
  category: string;
  club_id: number;
  created_at: string;
  created_by: string;
  id: number;
  path: string;
  doc_name: string;
  updated_at: string;
}

export interface UploadDocVisibility {
  archivedDocument: string[];
  clubDocument: string[];
  currentStatus: string[];
  myDocument: string[];
}
