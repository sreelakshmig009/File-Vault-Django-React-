import axios from 'axios';
import { FileUploadResponse } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const handleServiceError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    return new Error(
      error.response?.data?.message || 
      error.message || 
      'API request failed'
    );
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error('Unknown error occurred');
};

export const fileService = {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_URL}/files/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async getFiles(params?: Record<string, any>) {
    try {
      const { data } = await axios.get(`${API_URL}/files/`, { params });
      return data;
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async deleteFile(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/files/${id}/`);
    } catch (error) {
      throw handleServiceError(error);
    }
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${API_URL}${fileUrl}`;

      const response = await axios.get(fullUrl, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw handleServiceError(error);
    }
  },
};
