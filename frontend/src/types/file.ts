// types/file.ts
export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string; 
  checksum: string;
  is_duplicate?: boolean;
  original_file?: string;
}

export interface FileUploadResponse {
  status: 'success' | 'duplicate' | 'error';
  message: string;
  file?: File;
  existing_file?: File;
  original_filename: string;
  saved_bytes?: number;
}

export interface ApiResponse {
  results: File[];
  next: string | null;
  previous: string | null;
  count: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}